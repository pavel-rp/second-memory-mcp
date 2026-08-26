# `00` — Method, provenance, and the assembly record

**Task:** NEU-1007 (SUB-14) · **Charter:** C011 (umbrella NEU-893) · **Covers:** OUT-20
**Verification cutoff:** `d526ffe` (`origin/develop`), 2026-08-26
**Model:** claude-opus-5[1m]

---

## 1. What this chapter is

The package's fifteenth position and its only reconciliation pass. Fourteen producing sub-tasks —
SUB-1 … SUB-9, SUB-11, SUB-12, SUB-13, SUB-15, SUB-16 (SUB-10 is retired and produced nothing) —
each wrote a chapter, decision records, traceability rows and register entries **append-only**,
keeping both sides on every conflict. That discipline is what let fifteen authors work in parallel;
its cost is that nobody could correct anybody, so every cross-author conflict was *registered* rather
than resolved and routed here.

This chapter records **the method**, **every count re-derived rather than inherited**, **the six
adjudications**, **what changed and what was deliberately left alone**, and the two closure
statements the charter requires: the `NEU-896` boundary and the `A-28` handover.

**This chapter authors no register entry.** Under charter assumptions 46 and 47 assembly aggregates
and checks; it does not write an entry's content and it does not derive a success measure. Where a
register is short, that is reported as a routed gap against its named author. The one place a
published claim is *changed* rather than reported is §4.2, and the reason is given there.

### 1.1 Position, and what follows

SUB-17 (NEU-1008) is position 16 and audits **this** output. Six things are SUB-17's and are
deliberately absent here: the split-fidelity record, the package-completeness gate's content
(`97_package-completeness-gate.md`), the citation audit, the risk-register audit, the
outcome-register audit, and the independent cold read. **This pass is not the gate and passes no
judgement on whether the package is complete.**

## 2. `97_` ownership, stated so SUB-17 knows what it is auditing

**SUB-17 owns `97_package-completeness-gate.md`'s content. SUB-14 owns only its slot placement and
its cross-register consistency.** Three independent statements agree, and none is this chapter's:

1. The decomposition's register item 8 — *"its slot is placed here and left for **SUB-17**, which
   owns and publishes its content after this pass."*
2. The decomposition's out-of-scope clause — *"the split-fidelity record, the **package-completeness
   gate**, the citation audit, the risk-register audit, the outcome-register audit and the
   independent cold read — **SUB-17 owns all six**."*
3. `97_package-completeness-gate.md`'s own header — *"The gate is filled by **SUB-17 (NEU-1008)** at
   position 16, after **SUB-14 (NEU-1007)** assembles the package at position 15."*

The appearance of ambiguity has two sources, and both dissolve on reading. SUB-1 recorded **specific
reconciliation items** inside `97_` rows as SUB-14's — `G-15`'s `CAP-S1-2`, `G-S5-6`'s miscount,
`G-S9-13`'s spike figure. Those are *items routed to SUB-14 that happen to be recorded in `97_`*, not
ownership of the register. And SUB-13 wrote a `### SUB-13` section into `90_`–`97_` because **every**
producing sub-task appends its own gate rows; that is the shared-append convention, not a claim.

**Consequence: this pass writes no `97_` gate row.** One adjudication `97_` explicitly asks of SUB-14
is discharged in §4.6 below, in this chapter, rather than in `97_`.

## 3. The register census — every figure re-derived at `d526ffe`

Counted mechanically over entry headings, and cross-checked by a second, independently written
per-`### SUB-<n>` sum. Both agreed on every line.

| Register | Entries | Notes |
| --- | --- | --- |
| `90_outcome-register.md` | **19** | OUT-1 … OUT-19. **OUT-20 is a reserved slot** SUB-17 fills. |
| `91_findings-register.md` | **88** | Includes `F-S7-8`, withdrawn in place (§5.4). |
| `92_risk-register.md` | **49** | 11 charter-row `R<n>` + 38 scoped `R-S<n>-<k>`; `R5`/`R6`/`R7`/`R15` reserved for SUB-17. |
| `93_open-items-and-provisional-register.md` | **34** | |
| `94_caps-and-incomplete-scope.md` | **13 headings** | **12 caps minted by C011**, plus one recorded disposition of C010's `CAP-S5-1`, which C011 declines to mint. |
| `95_stand-in-assumption-register.md` | **22** | 2 charter-continued (`A-33`, `A-34`) + 20 scoped. |
| `96_spike-register.md` | **33** | **Zero executed.** See §4.4. |
| `97_package-completeness-gate.md` | **149 rows** | SUB-15 and SUB-16 wrote none, by decision (§4.6). |
| **Band total** | **407 headings** | 406 C011-minted ids + 1 C010 disposition. |

**Cross-register consistency: clean.** Of 406 minted ids, **zero appear as an entry in more than one
register** — checked mechanically, not asserted. The eight registers use disjoint id-family prefixes,
so the property holds by construction as well as by measurement; both are reported because
construction can be broken by a future author and measurement cannot be argued with.

**All eight registers are present.** No divergence note is owed.

## 4. The six adjudications

### 4.1 Two id schemes, reconciled without renumbering

Three families carry two forms. The reconciliation is **by origin and by concurrency**, and nothing
is renumbered.

| Family | Flat form | Scoped form | Who uses which |
| --- | --- | --- | --- |
| Risks | `R<n>` = charter § Risks row position | `R-S<n>-<k>` | Flat for the 15 charter rows; scoped for every risk with no charter row. |
| Stand-ins | `A-<n>` = the charter's own assumption number | `A-S<n>-<k>` | `A-33`/`A-34` flat (SUB-1); `A-S2-1`/`A-S3-1` scoped **for the same class of thing**. |
| Gate rows | `G-<n>` flat | `G-S<n>-<k>` | `G-1`…`G-15` (SUB-1), `G-16`…`G-25` (SUB-3) flat; scoped thereafter. |

**The risk family is a clean partition** — a risk either occupies a charter row or it does not — and
needs no adjudication beyond §4.2.

**The stand-in family is not, and this is the one that had to be settled.** All four of the charter's
`[unconfirmed]` assumptions (33, 34, 35, 36) received a stand-in, but under two schemes: SUB-1 wrote
`A-33` and `A-34` charter-continued, while **SUB-2's `A-S2-1` stands in for charter assumption 35 and
SUB-3's `A-S3-1` stands in for charter assumption 36** — the same class of entry, scoped. That was
not drift. `A-S3-1` records the reason in terms: the charter-continued scheme *"is not safe under
concurrency — several sub-tasks run at once, each would compute 'the next charter assumption number'
independently, and because register conflicts resolve by keeping **both** sides, two sub-tasks
picking the same number would land two rows sharing one id."*

**Adjudication: the scoped form is canonical; `A-33` and `A-34` stand as written, grandfathered.**
The correspondence is published here rather than encoded in the number, which is exactly what
`A-S3-1` argued for:

| Charter assumption | Stand-in entry | Author | Form |
| --- | --- | --- | --- |
| 33 — backups exist | `A-33` | SUB-1 | charter-continued |
| 34 — hosting / TLS / monitoring / log-shipping not discoverable | `A-34` | SUB-1 | charter-continued |
| 35 — the production learner flow yields a human `sub` | `A-S2-1` | SUB-2 | scoped |
| 36 — the two log tables are in scope for `NEU-850`'s "every core table" | `A-S3-1` | SUB-3 | scoped |

**`G-16`…`G-25` stand as written.** SUB-3 took a contiguous block after SUB-1's `G-1`…`G-15`; every
later author used the scoped form for the same concurrency reason. Renumbering 149 gate rows to buy a
consistency the origin rule already supplies would move every downstream citation of them, and
`97_`'s content is SUB-17's in any case (§2).

**The seed README's licence to renumber is therefore declined, with a reason** rather than ignored.

### 4.2 `F-S3-3` — the risk allocation across all fifteen charter rows

The rule is stated twice, identically: *"`R<n>` is the row's position in the charter's § Risks
table."* Applying it to the charter's own fifteen-row table gives the allocation of record.

**The defect is a transposition of rows 10–12, and it was in the index table, never in the entries.**
`92_risk-register.md`'s allocation table listed `R10` = compatibility contract, `R11` = lifecycle
half, `R12` = legal determination. The charter's rows 10, 11, 12 are legal determination (Medium,
OUT-9), compatibility contract (High, OUT-16), lifecycle half (High, OUT-9). **Every authored entry
already followed the charter**: `R10` is legal determination, `R11` is the tool count, `R12` is the
greenfield lifecycle half — each computed from the charter by its own author, and all eleven
authored ids agree with charter position.

**Provenance of the transposition.** It is not a lone slip: the permuted order appears in the
decomposition (`_local/…/02_subtasks.md`, gitignored), in the `NEU-1007` tracker description, and in
the index table copied from them. The charter's § Risks table and all eleven entries carry the
correct order. Four artifacts downstream of the charter carry the permutation; the charter and the
register content do not.

**Resolution: the rule governs. The index table is corrected; no entry id moves and no entry body is
touched.** This is the single place in this pass where a published claim is changed rather than
reported, and the ground is narrow — the table contradicted a rule stated eleven lines above it.

`A-S11-1`, SUB-11's registered premise, is **discharged, not invalidated**. Its re-validation trigger
is *"SUB-14's aggregation pass"*; its invalidating outcome was *"SUB-14 establishes that the two
readings differ — that is, that the charter moved rather than the allocation table having been
written wrong."* The charter did not move. The allocation table was written wrong. `R11`'s id and its
content are both correct and nothing is renumbered.

The allocation of record, all fifteen rows:

| Id | Risk | Severity | Owning outcome | Author | State |
| --- | --- | --- | --- | --- | --- |
| `R1` | Mechanism ships, cross-learner exposure remains | Critical | OUT-8 | SUB-5 | authored |
| `R2` | Erasure completes on paper | Critical | OUT-12 | SUB-9 | authored |
| `R3` | Transport gate sequenced last | Critical | OUT-3 | SUB-7 | authored |
| `R4` | Cannot be rolled out or rolled back | High | OUT-4 | SUB-7 | authored |
| `R5` | Inherited 18-question universe | High | OUT-20 | SUB-17 | **reserved slot** |
| `R6` | `NEU-896` overlap on the handoff boundary | High | OUT-20 | SUB-17 | **reserved slot** |
| `R7` | Scope drifts from List B | High | OUT-20 | SUB-17 | **reserved slot** |
| `R8` | Production access incident or capture leak | High | OUT-18 | SUB-1 | authored |
| `R9` | Unprobed dirty-data pathology survives the dry-run | High | OUT-2 | SUB-6 | authored |
| `R10` | Legal determination asserted, authority overstated | Medium | OUT-9 | SUB-3 | authored |
| `R11` | Contract written against a stale tool count | High | OUT-16 | SUB-11 | authored |
| `R12` | Lifecycle half written as if it had an upstream | High | OUT-9 | SUB-3 | authored |
| `R13` | `n = 1` evidence | Medium | OUT-18 | SUB-1 | authored |
| `R14` | Spike becomes implementation, or a stale spike is cited | Medium | OUT-18 | SUB-1 | authored |
| `R15` | Vocabulary collision with the domain's own terms | Low | OUT-20 | SUB-17 | **reserved slot** |

**Eleven authored, four reserved, fifteen accounted for. No duplicate, no gap, no collision.** The
four reserved are SUB-17's by the charter, not by this pass's choice.

### 4.3 `46 − 3` versus the thirteen-row mapping

**The two derivations never disagreed on the number.** `01_…md` §8 derived 43 as `46 − 3`.
`11_…md` §1.3 derives 43 as a thirteen-row module-by-module mapping and states that *"`46 − 3 = 43`
is arithmetic, not evidence"*. Both reach 43. What differed was the **evidential status** of the
route, and only one of the two said so.

**Surviving derivation: `11_` §1.3's mapping.** It is exact in both directions — no gated tool lacks
a `context_token` declaration and no declaration lacks a gated tool — it is independent of the
exempt-set literal, and its Total row reproduces 46 / 3 / 43, so it subsumes the subtraction rather
than competing with it. `01_` §8's subtraction is retained and **re-labelled as a cross-check**.

Re-derived here at `d526ffe`, independently of both chapters:

- **46 registered** — `server.registerTool(` occurs 46 times across `src/server/`, and the
  per-module counts reproduce `11_` §1.3's table row for row.
- **3 exempt** — `EXCLUDED_TOOLS` (`src/transport/context-token-middleware.ts:5`–`:9`) holds exactly
  `init_agent_context`, `get_server_info`, `get_server_workflow`.
- **43 gated** — `context_token:` occurs 46 times across `src/`, of which `11_` §1.3 names three as
  non-declarations (two `.transform()` destructuring targets, one response field). 46 − 3 = 43, and
  the module-by-module mapping balances.

**46 registered / 43 gated / 3 exempt — confirmed at a third independent cutoff.** `42` is not
asserted as a codebase fact anywhere in this package; every occurrence names it as the superseded
miscount it is.

### 4.4 The spike total, recounted

**33 spikes designed. Zero executed.** Counted mechanically over `96_spike-register.md`'s entry
headings at `d526ffe`, two independent ways, both giving 33 with no duplicate.

Four figures are in circulation, and **none of their authors erred**:

| Figure | Where | Status |
| --- | --- | --- |
| 24 | `F-S9-2`, the owning finding | true at SUB-9's branch HEAD |
| 32 | `96_…md` § SUB-12 — *"24 before, 8 added here, 32 in total"* | true at SUB-12's branch HEAD |
| 25 | `96_…md` § SUB-13 — 24 + 1 | true at SUB-13's branch HEAD |
| **33** | this pass | **true in the merged register** |

SUB-12 and SUB-13 branched from the same base of 24 and never saw each other: **24 + 8 + 1 = 33.**
SUB-12 wrote *"each figure is only correct on the day it is written… a reader should recount rather
than cite it forward"*, and SUB-13 argued the same at length. Both were right. **The defect is that
the merged register stated no post-merge total, and its most recent prose figure undercounts the
merged content by eight.**

**Action: reported, not rewritten.** The historical per-cutoff figures are correct statements about
their cutoffs and are left exactly as written; `F-S9-2` remains the owning finding and no second
record of the quantity is minted. The merged figure is stated **here**, once, at a named cutoff.

**One thing is repaired rather than reported.** `F-S9-2`'s deeper point was that two *counting
methods* disagreed — distinct `SPK-` ids versus `####`-level headings — by exactly the number of
entries written at `##` level, a gap that *"is not fixed at two"* and had already grown to three.
`F-S9-2` names SUB-14 as *"the only party that may normalise a heading level in a merged file"*. The
three `##`-level entries — `SPK-S16-1`, `SPK-S8-1`, `SPK-S11-1` — are now `####`, so **all 33 entries
sit at one level and the two methods return the same number.** No entry body was touched; only the
three heading markers changed. (Two chapters refer to *"the two headings"*; that was true when they
were written, and `F-S9-2` records the growth from two to three.)

`F-S4-6` — the earlier arithmetic reconciliation, where SUB-2's *"twelve"* omitted SUB-15's four — is
discharged by the same recount: its correction chain (16 at SUB-2's revision, 18 at SUB-4's, 19 once
SUB-16 landed) is superseded by the merged 33, and no sub-task's original line is edited.

### 4.5 The citation gate, and what arming it actually surfaced

`CAP-S1-2` is discharged: C011 is now in the `GATED` list in `scripts/check-citation-paths.ts`. This
is the one change this package makes outside `docs/`, it touches neither `src/` nor `drizzle/`, and
the cap's own text named it as the closing action.

**Armed, the gate reports C011 clean: 77 files · 4,868 citations · 2,470 resolve · 0 non-resolving ·
0 exempted by design, exit 0.** That is not luck. Eleven chapters record having run the checker by
hand locally, precisely because the cap left the local run as the only enforcement.

**Arming it caught two real defects, and both were this chapter's.** On its first run over the
assembled package the gate failed with two `C3-bare-upstream` findings in `00_method-and-provenance.md`
— two C010 files cited by bare filename where the convention requires one `../`. Both are fixed. It
is worth recording that the only citation defects the newly armed gate found in the entire charter
were introduced by the pass that armed it, and that it caught them immediately.

*(Figures throughout this section are measured over the **published** package, which includes this
chapter and the superseded README. Where the assembly **input** — the fourteen merged chapters as
received — gives a different number, both are given, because the classification work was done against
the input and this chapter's own additions are quotations of the targets it classifies.)*

**A clean summary is not evidence, so all three blind spots were tested.**

1. **The `…` shorthand.** `scripts/citation-paths/checker.ts:121` returns `null` for any token
   containing `…` or `...`, so such refs are never counted. **Measured over the input: 23**
   shorthand-exempt path-shaped tokens across 9 files, at most 5 in any one file. **Published total:
   32**, the difference being 9 in this chapter, every one of them a quotation of a token it is
   classifying. Every one of the 32 is a deliberate class noun (`src/…`, `drizzle/…`, `../C010-…/`)
   or an elided sibling chapter (`../01_…md:154`). **None masks a broken corpus citation.**
2. **The `MISSING-target` bucket.** `checker.ts:247`–`:266` buckets a nowhere-resolving target there,
   and `isFailing` (`:342`–`:346`) tests only `inScope` and `staleNonClaims` — so this bucket **can
   never fail the gate and never appears in the summary**. Read entry by entry: **235 occurrences
   over 73 distinct targets** in the input (**260 over 75** in the published package, the difference
   being this chapter's own quotations), every one classified (§5.1). **Zero unreported broken
   citations.**
3. **A third blind spot, found here and not previously recorded.** `normalizeCandidate`'s
   line-reference stripper is `(:\d+(?:,\d+)*)+$` (`checker.ts:130`). It handles `:60`, `:60:4` and
   `:52,183` — but **not a hyphenated range like `:8-9`**. A `src/…` citation written with a range
   therefore lands in `MISSING-target` instead of the intended `repo-root-source` class. All ten such
   targets in C011 resolve to files that exist, so nothing is broken today; the **class** is
   mis-bucketed, and a *wrong* `src/` path written with a range would be invisible. **Reported, not
   fixed** — changing `normalizeCandidate` is a behaviour change to a shared CI gate and belongs with
   its own test case, not in an assembly pass.

**The `GATED` change is a data-list addition and alters no checker behaviour**, so
`tests/unit/scripts/citation-paths.test.ts` (39 tests) passes unchanged and needs no new case: that
suite injects its own `gated` array, and the shipped list's contents are covered by the CI step
itself, which fails if C011 ever regresses.

### 4.6 The `97_` gate-row divergence — adjudicated

`97_` records a disagreement it asks SUB-14 to settle. SUB-2 and SUB-4 wrote gate rows into it;
SUB-15 and SUB-16 deliberately wrote none, on `DR-C11-S15-3`'s ground that the register names SUB-17
as its owner. SUB-2 diverged knowingly, because it had an acceptance condition it could not meet and
wanted a row to carry it.

**Adjudication: both stand, and neither is a defect.** §2 establishes that SUB-17 owns the register,
which makes writing no row correct. A row authored early is a routed claim its author is accountable
for, which makes writing one also correct — and strictly more informative. The divergence is
**recorded, not normalised**: normalising would mean either deleting 95 rows or authoring two
sections, and both are forbidden here. SUB-17 inherits 149 rows from eleven sub-tasks, and the
knowledge that two sub-tasks' silence is deliberate rather than missing.

## 5. Four checks whose result a summary line cannot show

### 5.1 The `MISSING-target` bucket, classified

**235 occurrences over 73 distinct targets in the assembly input; 260 over 75 in the published
package.** Every target falls in one of six classes, and **none is an unreported broken citation.**
The counts below are the input's, because they are what was classified; the 25 further occurrences
and 2 further distinct targets are this chapter quoting them.

| Class | Distinct targets | What they are |
| --- | --- | --- |
| Prose and protocol nouns | 14 | `tools/call`, `tools/list`, `prompts/get`, `prompts/list`, `/mcp`, `n/a`, `if/else`, `.sql`, `@modelcontextprotocol/sdk`, `pgvector/pgvector:pg16`, `origin/develop`, `feat/NEU-1004-…`, `COMPOSE_DIR=…`, `/home/deploy/docker-services/second-memory-mcp`. Path-shaped strings that are not citations. |
| Bare source basenames | ~40 | `schema.ts`, `http.ts`, `chunk-tools.ts`, … — source files named by basename in prose after being introduced with a full path. Not corpus targets; the checker cannot repair them because they are not corpus files. |
| Hyphen-range `src/` paths | 10 | `src/transport/http.ts:82-83` and nine more. **All ten files exist.** Mis-bucketed by blind spot 3 (§4.5). |
| Gitignored charter references | 2 | `01_charter.md` (×7), `02_subtasks.md` (×2). The charter is the package's own spec and lives in gitignored `_local/`, so a reader cannot follow them. Legitimate provenance, unfollowable by design — which is *why* charter assumption 46 exists and the risk register ships. |
| Extension-less decision-record refs | 3 | `decision-records/DR-C11-S13-1`, `…/DR-C11-S9-1`, `…/DR-C11-S9-3`. **Examined by SUB-13 and ruled not broken** — *"None of the three is a broken citation"* — noting SUB-9 established the shape. **Left as written.** |
| A by-design non-claim | 1 | See §5.2. |

### 5.2 The one thing that looks exactly like a break and must not be repaired

`07_…md` cites `DR-C10-S8-2_token-bound-identity.md`, which does not exist — the real C010 file is
`../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md`.
**That wrong filename is the chapter's
own evidence.** `07_…md` quotes it in order to report that a plain wrong filename is invisible to the
gate, which is precisely the twelfth by-design non-claim class the exemption registry names.
Repairing it would destroy the finding it exists to demonstrate — `DR-C10-S12-2` Rationale (ii),
*"a repaired citation is byte-identical to one that was never broken."*

**Left exactly as written.** It needs no `NON_CLAIMS` entry: because the name resolves nowhere it
buckets as `MISSING-target`, which is not gated. Had the filename been *right* but the form bare, it
would have bucketed `C3-bare-upstream` and failed the newly armed gate — which is the sharpest
available illustration of why blind spot 2 had to be read entry by entry rather than summarised.

### 5.3 The findings-register enumeration, in both directions

Charter assumption 49 names **eleven** finding-producing outcomes: OUT-2, OUT-3, OUT-4, OUT-8, OUT-9,
OUT-10, OUT-11, OUT-12, OUT-14, OUT-17, OUT-18.

- **Direction 1 — every named outcome carries the requirement in its own charter text: 11 of 11.**
- **Direction 2 — every outcome whose text carries the requirement is named: 11 of 11.**

**Two counts, both eleven. No mismatch in either direction.**

**Method, stated because a cruder one gives a false answer.** A bare keyword match over the charter's
outcome table returns **twelve** carriers, because OUT-20's row uses the word "finding" five times.
Reading those five sentences shows every one of them *describes the findings register* or *specifies
the enumeration audit* — none is a requirement that OUT-20 itself produce a finding. OUT-20 is
therefore correctly excluded, and the honest counts are 11 and 11. The cruder method would have
reported a mismatch that does not exist.

### 5.4 Two id irregularities, both benign, both recorded

- **`F-S7-8` is withdrawn in place, not a gap.** Its heading exists and carries the reason: the fact
  it would have recorded was already `F-S3-3`. The id is retired rather than reused so it is never
  minted twice. The findings count of 88 includes it.
- **`CAP-S1-3` is a phantom.** Four merged records rest the `qa-execution` no-op on it and it is
  **defined nowhere**; `94_…md` says so outright, and it is already registered as `F-S11-5` with
  SUB-14 as owner. **Adjudication: the id is void and no cap is minted for it** — minting one here
  would author register content, which is forbidden. The fact it stood in for is true and unchanged
  (the registry is `git, linear`, no capability owns `qa-execution`, and the QA phase is a genuine
  Core Article 8 no-op) and it is stated at package level in `README.md`, which is where a
  package-level condition belongs. `F-S11-5` is the record; SUB-17's band-completeness audit meets a
  declared void id rather than a dangling one.

## 6. The C010 id collision disclosure, complete

Both packages number entries with a sub-task segment (`F-S5-1`, `CAP-S7-1`, `OI-S8-1`, …), and both
charters had sub-tasks at most of the same numbers. **A bare id is therefore ambiguous across the two
packages wherever both define it.**

**Measured, not estimated: 124 id strings are defined as an entry in both C010 and C011.** Computed
by intersecting the entry ids of C010's register band with C011's, and confirmed by a second
independent run.

| Family | Colliding ids | Disclosed in prose before this pass? |
| --- | --- | --- |
| `F-S<n>-<k>` | 52 | Partially — 14 named across five sub-tasks |
| `G-<n>` (flat) | 25 (`G-1` … `G-25`) | **No — not disclosed anywhere** |
| `OI-S<n>-<k>` | 19 | Partially — 4 named |
| `CAP-S<n>-<k>` | 12 | Partially — 5 named |
| `OUT-<n>` | 12 (`OUT-1` … `OUT-12`) | **No — not disclosed anywhere** |
| `SPK-S<n>-<k>` | 4 | No |
| **Total** | **124** | ~26 individually disclosed |

**The disclosures that exist are accurate and were verified.** SUB-7 disclosed six
(`F-S7-1`…`F-S7-4`, `OI-S7-1`, `CAP-S7-1`); SUB-13 disclosed five (`F-S13-1`…`F-S13-4`, `OI-S13-1`)
and correctly noted `CAP-S13-1` does *not* collide; SUB-5 disclosed four; SUB-8 disclosed six in its
own chapter; SUB-2 established the governing rule; SUB-4, SUB-9 and SUB-12 each disclosed at least
one. None is wrong. **They are individually correct and collectively incomplete**, which is the
expected result of fifteen authors each disclosing what their own chapter touched.

**Two collision classes were disclosed by nobody, and both are structural rather than per-sub-task:**

- **`OUT-1` … `OUT-12`.** Both packages number outcomes flat and unscoped. Every one of C010's twelve
  outcome ids is a literal duplicate of a C011 outcome id. Only `OUT-2` is ever disambiguated in
  practice, and then by paraphrase (*"`NEU-850`'s `OUT-2`"*) rather than by a stated rule.
- **`G-1` … `G-25`.** Both packages' completeness gates use flat `G-<n>`. C011's own switch to
  `G-S<n>-<k>` is justified at length — but **only** as a fix for intra-C011 parallel authoring; the
  pre-existing cross-package collision with C010's flat band is named nowhere.

**The governing rule, and where it actually lives.** `README.md` § Id conventions states it for
**sub-task references** only: *"A C010 sub-task is always cited qualified — `SUB-10 of C010
(NEU-984)` — never as a bare `SUB-n`."* The general rule for **entry ids** was established later and
mid-package by SUB-2's `F-S2-2` — *"a cross-package open item is always written qualified… A bare
`OI-S1-2` always means this package's own"* — and extended to findings, caps and decision records by
SUB-5. `F-S2-2` explicitly handed the README amendment to SUB-14. **It is made in this pass**: the
superseding `README.md` now states the rule for every id family, and extends it to `OUT-<n>` and flat
`G-<n>`, which no prior statement reached.

**A live instance, preserved rather than repaired.** Three places cite a bare `OI-S8-1` meaning
C010's, written before C011 minted its own; the package caught this itself and declined to change it,
because each names the owner parenthetically and each was correct when written. This pass agrees and
leaves them: the README rule now covers the reader, and rewriting three historically-correct
sentences to satisfy a rule that postdates them would be revisionism, not assembly.

**Read `CAP-S5-1` as the model case.** C011 deliberately does **not** mint it: `94_…md` records it as
a discharge record for C010's cap and states *"a bare `CAP-S5-1` anywhere in this package means
C010's."* That is why the band carries 407 headings but 406 C011-minted ids.

## 7. What this pass changed, and every deletion

Fourteen chapters were append-only. This pass holds the only amend authority in the charter, and it
is used in **eight** places. Every one is listed; every deletion is counted and named.

| # | Change | Files | Lines removed | Authority |
| --- | --- | --- | --- | --- |
| 1 | C011 added to the citation `GATED` list | `scripts/check-citation-paths.ts` | 1 (replaced by 4) | `CAP-S1-2`, owner SUB-14 |
| 2 | 32 wrong `SUB-<n> (NEU-<m>)` routing ids corrected | 8 package files | **0** — all same-line substitutions | `F-S11-1`, `F-S12-8`; owner SUB-14 |
| 3 | 5 stray `</content>` tags removed | `15_`, `traceability/S15_`, 3 × `DR-C11-S15-*` | **5** | `F-S5-13`; owner SUB-14 |
| 4 | 3 spike headings normalised `##` → `####` | `96_spike-register.md` | **0** — marker change only | `F-S9-2`; owner SUB-14 |
| 5 | Risk index table rows 10–12 un-transposed, with a note | `92_risk-register.md` | **0** — 3 rows reordered in place | `F-S3-3`; owner SUB-14 |
| 6 | `46 − 3` re-labelled as a cross-check | `01_…md` | **0** — one line expanded | §4.3; owner SUB-14 |
| 7 | Glossary `write-path closure` falsifier corrected | `docs/GLOSSARY.md` | **0** — one clause replaced | `F-S12-7`; owner SUB-14 |
| 8 | `README.md` superseded; this chapter added | `README.md`, `00_…md` | see §7.1 | decomposition; `README.md:14`–`:16` |

**Total content removed and not replaced: 5 lines**, all of them the stray `</content>` artifact, all
in files authored by one sub-task, all verified terminal before removal. Those five files are the
only ones whose `git diff --numstat` reads `0` added against `1` deleted.

Stated in git's own terms, so the number cannot be read two ways — `--numstat` counts a modified line
as one deletion plus one addition, so its totals are larger than the content actually removed:

| Kind | Lines | Where |
| --- | --- | --- |
| Removed and not replaced | **5** | the five stray `</content>` tags |
| Substituted in place (equal add/delete) | **35** | 31 lines carrying 32 tracker-id corrections, 3 spike heading markers, 1 glossary clause |
| Expanded in place | **2 → 23** | `01_`'s cross-check re-label (1 → 9); `92_`'s three reordered rows plus the correction note (6 → 20) |
| Superseded wholesale | **91 → 161** | `README.md`, which its own seed text designates for supersession |
| Added | **new file** | `00_method-and-provenance.md` |

**No line is deleted anywhere in this package outside those five and the declared README
supersession.** No register entry body is altered, no entry is removed, and no id is renumbered.

**Verified after every edit pass:** no NUL byte, UTF-8 round-trips byte-identically, and zero U+FFFD
replacement characters in any touched file. (Seven multi-byte-heavy files were edited; the check
exists because an in-place editor silently corrupted a chapter's multi-byte characters earlier in
this charter's history.)

### 7.1 The `README.md` supersession

SUB-1's seed says of itself: *"SUB-14 (NEU-1007) owns the package's house-style assembly and
supersedes this file… Where SUB-14 diverges, SUB-14 is right."* It is superseded rather than edited.
Four things carry forward unchanged because they were right — the eight-register band and its
enumeration order, the `S<n>`-is-a-sub-task-number rule, the citation convention, and the
`qa-execution` verification note. Four things change: the reading order now spans all fourteen
chapters, the register table carries live counts, the id conventions state the cross-package rule
`F-S2-2` handed here, and the citation section records that the gate is now armed.

### 7.2 What was deliberately **not** changed

Reported, not absorbed — SUB-17 audits this list:

- **`F-S13-8`** (*"six stages apart"* should be four) and **`F-S13-11`** (two disable paths
  misassigned). Both are corrections to SUB-7's text, and both findings name **SUB-7** as the party
  that may edit it, naming SUB-14 only for aggregation. SUB-7 has shipped. **This pass does not
  override a merged sibling's explicit routing**; both are carried forward unactioned and are
  SUB-17's to route onward. Neither figure is repeated anywhere in this chapter.
- **The four extension-less decision-record references** — examined and ruled not-broken by SUB-13.
- **The three bare `OI-S8-1` uses** — correct when written; see §6.
- **`F-S12-8`'s own evidence table and two verbatim quotations of C010's register**, which contain
  seven wrong `SUB-<n> (NEU-<m>)` pairings *as their evidence*. Repairing them would delete the proof
  of the defect they report. They are excluded by name from the correction in row 2 above.
- **`97_`'s divergence** on whether SUB-15 and SUB-16 owed gate rows — adjudicated in §4.6, not
  normalised.
- **A missing blank line before some `###` headings**, which pre-exists on `develop`. Two sub-tasks
  confirmed and left it; this pass leaves it too, because normalising it would touch many files for
  no reader-visible gain and would inflate a diff whose whole value is that every hunk is nameable.

## 8. What the package hands to each recipient

Aggregated from the entries' own `Handed to:` fields. **This pass authors none of these routings; it
collects them so a reader sees the seams in one place.**

**To `NEU-895` (C010), as recorded amendments:**
- `F-S3-4` — C010's `../C010-system-and-repository-architecture/04_state-category-inventory.md` heads
  the inventory *"41 entries"* while its own §8 count table, its id range and its subsection sums all
  say **45**.
- `R3` — the transport-gate sequencing risk, escalating on C010's `I4`→`I5` consequence.
- **`DR-C11-S12-2` — the package's first genuine contradiction of a C010 decision:** a cross-learner
  failure mode that `DR-C10-S5-1`'s five checks cannot generate. Twelve chapters ran C010 checks
  clean before this one; it is an amendment routed under charter assumption 1's bounded right, naming
  the contradicting evidence, and is **not** a silent divergence.

**To `NEU-896`, at convergence:** `R4`, `R-S7-1`, `F-S7-5`, `F-S7-7`, `F-S9-1` (external-provider
egress), `F-S9-5` (the stderr sink no erasure reaches), `F-S11-2` (the DP rubric in the core
surface), `R-S11-1`, and `R9`'s **pre-flight re-run of the probe set and its stated abort condition**
— obligations the implementation charter inherits, not defects this package can close.

**To `NEU-986` (`SUB-12 of C010`), owner of `CAP-S3-3` and `CAP-S4-1`:** `F-S3-1` — the whole,
unredacted `response_body` retained for a diagnostic purpose **no read path in the repository
exercises** — and `F-S9-6`, the 30-day window that sits five days below the 35-day floor the Tier-2
gate's own query fixes.

**To `NEU-984` (`SUB-10 of C010`):** the mechanism for **C010's** `OI-S8-1` (written qualified, since
C011 mints its own unrelated `OI-S8-1` — see §6), `OI-S8-2`, `CC-S8-3`, and `OI-S11-2` with its §6.2
fork between a single interposition adapter and a decorator at 46 registration sites.

### 8.1 What C010's `A-28` re-check is handed — the trigger has fired

`A-28` in C010's stand-in register is the stand-in for **NEU-893, this charter**, and its
re-validation trigger is *"NEU-893 lands — its package is published under `docs/research/`."*
**Publishing this package fires it.** Stating what the C010-side re-check receives is SUB-14's
closure obligation. It receives:

1. **The envelope held.** `A-28`'s tolerance envelope requires isolation to be enforceable
   server-side on the existing deployment, and its named invalidating outcome is *"a finding that
   safe isolation requires a separate deployment or a separate datastore."* **That finding was not
   reached.** `DR-C11-S5-1` places confinement at a principal-scoped adapter bound at construction —
   at or below the port boundary — with the database as an independent second layer. No sub-task
   concluded that a separate deployment or datastore is required.
2. **A first positive instance of the isolation invariant**, `DR-C11-S5-2` carrying `SC-S3-12` to
   `holds` against an enumerated access-path set — the thing C010's `CAP-S5-1` was the standing
   definition of done for. **`CAP-S5-1` is discharged, not lifted**, and the four-part landing
   condition under which it lifts is `OI-S5-2`.
3. **Five things the enforcement point does not confine**, which bound the envelope rather than
   breaking it: content egress to external providers (`F-S5-2`), `LD-S3-31`'s non-confinability, the
   unkeyed Tier-2 aggregate (`F-S5-9`), the non-retroactive boundary (`F-S5-10`) — and, from
   `12_…md` §7.4, **operator and direct `psql` access as a fifth**, which is *not* one of the four
   named in §6 and reaches learner state without entering the process at all.
4. **One contradiction**, `DR-C11-S12-2`, routed as an amendment to `DR-C10-S5-1` (§8).
5. **The standing evidence position:** every claim above is a cited derivation from the repository at
   a stated cutoff. **Zero spikes executed; `observed-in-production` applied to zero claims.** The
   re-check is being handed a design, not an observation.

### 8.2 The `NEU-896` boundary, stated as a seam

Charter risk `R6` is that OUT-19's artifacts and `NEU-896`'s *"implementation-ready program
packages"* remit collide and two packages each believe they own the handoff. The boundary:

**This package hands over, finished:** the identity rule and the persisted learner key; the STDIO
identity gate and what the context-token row carries; the enforcement point and its per-port table;
the data inventory and its classification; consent, export and erasure; the propagation matrix and
completion proof; the migration disposition for every unowned row; the ten-stage rollout with each
stage's irreversibility and disable path; the threat model and its gates; the DDL, migration plan and
runbook; the numeric operational objectives; the attribution carrier and detection matrix; the
compatibility contract over a re-counted surface; and this eight-register band.

**`NEU-896` still owns, and this package does not touch:** cross-package convergence; resolution of
conflicts between packages; the go / conditional-go decision; and every item in §8 routed to it —
each of which is a program-level exposure no single package can close.

**The seam is a boundary, not a claim.** Nothing here is asserted to be implementation-ready in the
sense `NEU-896` means; the artifacts are authored and reviewed and **not applied**, and the caps say
so — `CAP-S13-1` records that every artifact SUB-13 publishes is unexecuted, and `CAP-S7-1` that no
rollout stage is shown to fit `OBJ-8`.

## 9. The standing evidence position

Stated once, here, because the whole package rests on it and an assembly that flattened it would be
the most damaging thing this pass could do.

- **No production credential exists in the authoring environment.** `SMOKE_PROD_*`, `DATABASE_URL`,
  the `AUTH_*` set and the `VPS_*` set were probed and are unset — re-probed at `d526ffe`, still
  unset.
- **33 spikes designed, zero executed. `observed-in-production` is applied to zero claims
  package-wide.** Every number in this package is a cited derivation from the repository, a
  registered stand-in with an owner and a re-validation trigger, or a deferred spike with an expiry.
  **These three are different things and the package does not blend them.**
- **Under STDIO no audit or event row exists at all.** Verified four separate times by four
  sub-tasks, escalating from "env-gated" to the structural statement: the constructing code path is
  unreachable from `src/transport/main.ts:55`–`:59`, which builds a bare `StdioServerTransport` and
  nothing else; only `src/transport/http.ts:176`–`:182` constructs either pg transport.
  **Consequence: a count-based gate is *undefined* on STDIO, not zero** — and a gate that reads zero
  and concludes "no violations" would be reading the absence of a writer.
- **`db:studio:prod` (`package.json:48`) ships a CRUD GUI against production credentials**, outside
  every confinement mechanism this package designs.
- **Attribution is not retroactive.** Erasure under-reaches the pre-cutover population and
  confinement over-reaches it. That population is archived at the cutover instant (`DR-C11-S6-2`)
  and then bulk-deleted at archive close under storage limitation (`DR-C11-S9-1`), which downgraded
  the blocking `F-S8-2` to **resolved as a discharge of the design obligation, not of the rows**.
  Execution is `R-S9-1`, and it is not discharged by anything in this package.
- **`CAP-S7-1`: no rollout stage is shown to fit `OBJ-8`**, because the two data-moving stages scale
  with row counts nobody has taken. Re-shaped by SUB-13, not lifted.

## 10. What a reader may not conclude from this chapter

- Not that the package is complete — that is SUB-17's judgement at position 16, and §2 says so.
- Not that a green CI citation run proves every citation resolves; §4.5 gives three reasons it does
  not, and the entry-by-entry read in §5 is the actual evidence.
- Not that any figure here is observed. Every one is derived at `d526ffe` from the repository.
- Not that the 124 collisions are repaired. They are **disclosed and governed by a stated rule**; the
  ids themselves are permanent in both packages.
