# `98` — The audit record

**Task:** NEU-1008 (SUB-17) · **Charter:** C011 (umbrella NEU-893) · **Covers:** OUT-20
**Verification cutoff:** `5f8e9cb` (`origin/develop`), 2026-08-26
**Model:** claude-opus-5[1m]

---

## 1. What this file is, and the authority it has

The package's sixteenth and last position. SUB-14 assembled and published the package at position 15
and **passed no judgement on whether it is complete** (`00_method-and-provenance.md:32`–`:33`). This
file and `97_package-completeness-gate.md` § SUB-17 are where the package says whether it is
finished.

**Six audits are this sub-task's**, named by the decomposition and repeated in
`00_method-and-provenance.md:29`–`:31`: the split-fidelity record, the package-completeness gate's
content, the citation audit, the risk-register audit, the outcome-register audit, and an independent
cold read. All six ran. Each is reported below as **counts, not impressions**.

### 1.1 The authority this sub-task has, stated before it is used

**It may not repair anything.** The decomposition's out-of-scope clause is explicit: *"Producing or
repairing chapter content — every finding routes to the sub-task that owns the affected chapter,
decision record or register entry, and that routing re-opens the owning sub-task; this sub-task then
re-runs the affected audit against the repaired content, but never repairs it itself."* Amend
authority was SUB-14's alone (`00_method-and-provenance.md:480`), and it has shipped.

So this sub-task **appends and nothing else**. Its writes are exactly five, all additive:

| Write | Where | Authority |
| --- | --- | --- |
| The four OUT-20-owned risk entries `R5`, `R6`, `R7`, `R15` | `92_risk-register.md` § SUB-17 | charter § Risks rows 5, 6, 7, 15; slots reserved at `00_method-and-provenance.md:189`–`:199` |
| OUT-20's outcome-register row | `90_outcome-register.md` § SUB-17 | charter assumption 47; the reserved slot at `00_method-and-provenance.md:72` |
| This sub-task's findings | `91_findings-register.md` § SUB-17 | *"report as a finding; never absorb into prose"* |
| The gate verdict | `97_package-completeness-gate.md` § SUB-17 | `97_`'s own header; `00_method-and-provenance.md` §2 |
| This file | the reserved `90`–`99` band | *"The audit set published into the package's reserved `90`–`99` band"* |

**`git diff --numstat origin/develop` reports a deletions count of `0` on every file this sub-task
touches.** No entry body is altered, no id renumbered, no row rewritten, and no other sub-task's
section edited. Every defect below is **routed, not repaired** — including the ones this audit could
have fixed in a single line.

### 1.2 The re-audit loop, and why it terminated at round 1

The decomposition specifies a bounded loop: route → the owning sub-task re-opens and repairs → this
sub-task re-runs that audit → bounded at **two** full rounds → anything still standing becomes a named
residual cap.

**The loop is not executable at this position, and that is a structural fact rather than a choice.**
All fifteen predecessors have shipped and merged; there is no sub-task left to re-open, and this
sub-task may not repair on their behalf. Every finding below therefore completes **round 1** — routed,
with its owner named — and converges no further. Under the convergence bound, a finding still standing
after the bound is recorded as a **named residual cap with an owner and the reason it did not
converge**; the reason is the same for all of them and is stated once here rather than repeated
fourteen times: *the owning sub-task has shipped and this sub-task has no repair authority.*

This is reported rather than presented as convergence. A loop that cannot run is not a loop that ran
clean.

---

## 2. The split-fidelity audit against `DR-C10-S5-2`

**Method.** List A and List B taken **verbatim** from
`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:514`–`:529`
and `:531`–`:545`. Each List B question mapped one-to-one onto the published chapter and outcome that
answers it; each List A question checked for a C011 claim to have closed it. Counts reported.

### 2.1 List B — 8 of 8 answered

| # | List B question | Answered in | Outcome | Author |
| --- | --- | --- | --- | --- |
| `H1` | Identity mapping to the production Rauthy IdP | `02_identity-the-learner-key-and-principal-kind.md` §3; `decision-records/DR-C11-S2-1_the-persisted-learner-key.md` | OUT-1, OUT-5 | SUB-2 |
| `H2` | Migration of the existing global rows | `06_the-disposition-of-every-unowned-row.md` §3; `decision-records/DR-C11-S6-1_the-migration-disposition-scheme.md` | OUT-2 | SUB-6 |
| `H3` | Staged rollout | `07_the-rollout-sequence-and-what-each-stage-cannot-undo.md`; `decision-records/DR-C11-S7-1_the-rollout-stage-order.md` | OUT-3 | SUB-7 |
| `H4` | Rollback | `07_the-rollout-sequence-and-what-each-stage-cannot-undo.md` §9; `decision-records/DR-C11-S7-2_the-deploy-independent-disable-path.md` | OUT-4 | SUB-7 |
| `H5` | Does the production learner flow yield a human `sub`? | `02_identity-the-learner-key-and-principal-kind.md` §10 | OUT-5 | SUB-2 |
| `H6` | Will the resolved identity carry its `sub`/`azp` provenance, so `I5` is answerable? | `02_identity-the-learner-key-and-principal-kind.md` §7; `decision-records/DR-C11-S2-3_provenance-persistence-and-parallel-safe-id-families.md` | OUT-6 | SUB-2 |
| `H7` | An identity gate on the transport that has none, so `I4` can pass on both | `04_the-stdio-identity-gate-and-the-bound-context-token.md`; `decision-records/DR-C11-S4-1_the-stdio-identity-gate.md` | OUT-7 | SUB-4 |
| `H8` | Where the enforcement is mechanically implemented, at or below the port boundary | `05_the-enforcement-point-that-confines-every-read-and-write.md` §3; `decision-records/DR-C11-S5-1_the-enforcement-point.md` | OUT-8 | SUB-5 |

**`8 / 8` answered. `0` declined.**

**`H5` is answered, not declined, and the distinction is stated rather than assumed.** No production
token was observed for any principal shape, so `H5` is answered by a **registered stand-in** —
`A-S2-1` in `95_stand-in-assumption-register.md`, carrying charter assumption 35 verbatim with a named
owner and a re-validation trigger — plus `SPK-S2-1`, designed and not executed. `DR-C10-S5-2`'s
revision trigger fires on a question *declined*; an answer that states its own uncertainty, names who
closes it and names the event that closes it is the opposite of a decline. **The reader should
nonetheless know that `H5`'s answer is a stand-in and not an observation**, which is why it is flagged
here and not merely counted.

### 2.2 List A — 0 of 10 claimed

Each of `C1` … `C10` was checked for a C011 claim to have closed it. **Zero are claimed.** C011
consumes them: `C1` (ownership location) is consumed via `NEU-850`'s `OUT-2`; `C2`–`C4` (the invariant,
its checks, its verdict set) are consumed as the decision procedure SUB-5 applies rather than
re-derives; `C5` and `C6` are consumed as the *requirements* whose satisfying mechanism is `H8`;
`C7`–`C9` are consumed as verdicts; `C10` is C010's own no-amendment record.

**The one place this needed care.** SUB-5 carries `SC-S3-12` to verdict `holds`
(`05_the-enforcement-point-that-confines-every-read-and-write.md` §8) — the invariant's first positive instance. That is **applying** C010's procedure to one
category, which `../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:555`
routes to `SUB-14 of C010` and to `OI-S5-3`, *not* a claim to have closed
`C2`, `C3` or `C4`, which are about what the procedure *is*. C011 does not re-state the invariant, does
not add or remove a check, and does not alter the verdict set. **`C1`…`C10` remain closed by C010.**

### 2.3 The counts, with the bound they carry

| Measure | Count |
| --- | --- |
| List B questions answered here | **8 / 8** |
| List B questions declined | **0** |
| List A questions claimed here | **0** |
| Touched C010 residual ids in **two** classes | **0** |
| Touched C010 residual ids classifiable into **no** class | **0** |

**`DR-C10-S5-2`'s revision trigger did not fire.**

**And the bound, stated in the same breath as the counts rather than in a footnote.** C010's universe
is **18** questions and its own audit records that its two zeros are *"definitional, not empirical"*,
because the universe **is defined as** List A ∪ List B
(`../C010-system-and-repository-architecture/06_isolation-invariant-and-the-neu-893-split.md:580`–`:583`).
The universe was generated by walking `DR-C10-S5-1`'s five ordered checks, and **this package
deliberately did not re-derive it**. So `8 / 8` is 8/8 **against the list as written**. A question those
five checks never generated would be absent from the list this audit checks against, and absent from
this result. That is `R5`, and it is **not** a hedge added here — it is the risk the charter owns to
OUT-20 and requires be reported by name.

**`R5` fired.** SUB-12 found two failure modes `DR-C10-S5-1`'s five checks do not generate —
cross-learner actuation (`F-S12-1`) and a verdict set with no over-confinement outcome — and routed
`decision-records/DR-C11-S12-2_the-unconfined-aggregate-as-a-control-input.md` to `NEU-895` as a
recorded amendment, naming **SUB-17** as the recipient within this package
(`92_risk-register.md:924`). **This sub-task confirms receipt and records the route as fired.** It is
the package's only genuine contradiction of a C010 decision.

---

## 3. Every touched C010 residual id, classified into exactly one class

**Method.** The 142 residual ids C010 defines (caps, open items, bindings, findings, stand-ins) were
extracted mechanically from its register band and intersected against every mention in the C011
package. Mentions that resolve to **C011's own** id under the package's bare-id rule
(`README.md:131`–`:136`) are excluded — they are string collisions, not touches. What remains is the
set of ids C011 genuinely touches.

### 3.1 The charter's enumeration — 16 ids, all placed

| Class | Ids | C010 owner |
| --- | --- | --- |
| **owned here** | `OI-S5-2` | `NEU-893` — this package |
| | `OI-S1-2` | owner moved to `NEU-893` by `SUB-12 of C010 (NEU-986)`'s gate disposition (`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:615`) |
| | `CAP-S7-1` | `NEU-893`, co-named `NEU-986` at C010's gate and `NEU-896` at convergence — **discharged** by SUB-9, not lifted |
| | `CAP-S5-1` | co-owned with `NEU-986` — **discharged** under OUT-8 by SUB-5, **not lifted** |
| **resolved here** | `BND-S4-17` | recorded owner `nobody`; named by SUB-4 under **`OI-S8-2`**'s resolving event (`../C010-system-and-repository-architecture/90_open-items-and-provisional-register.md:429`) |
| **supplied-to** | `CAP-S3-3`, `CAP-S4-1` | `NEU-986` (`SUB-12 of C010`), co-named `NEU-896` |
| | `OI-S8-2`, `CC-S8-3` | `SUB-10 of C010 (NEU-984)`, co-named `NEU-896`; OUT-7 supplies the mechanism |
| | C010's `OI-S8-1` | `SUB-10 of C010 (NEU-984)`, co-named `NEU-896`; OUT-13 supplies the mechanism |
| **consumed-from** | `OI-S5-1` | `NEU-850` |
| | `F-S5-2`, `F-S5-4` | C010's findings, consumed by OUT-8 |
| | `F-S5-3`, `F-S8-1` | the settled 46 / 43 / 3, consumed by OUT-16 |
| | `A-28` | C010's stand-in for this charter; its trigger fires on publication |

**`BND-S4-17`'s citation names `OI-S8-2`, never `OI-S8-1`** — verified at
`04_the-stdio-identity-gate-and-the-bound-context-token.md` §11 and
`93_open-items-and-provisional-register.md` § *Disposition of `BND-S4-17`*, both of which cite `:429`
and attribute it to `OI-S8-2`. `OI-S8-1`'s own resolving event is at `:418`. **The corrected
attribution is reproduced and the round-1–5 mis-citation is not re-derived.**

**`CAP-S5-1` carries a real worked `holds` verdict** — `SC-S3-12`, derived in
`decision-records/DR-C11-S5-2_the-first-holds-derivation.md` against an enumerated access-path set —
and is recorded **discharged, not lifted**, with its four-part landing condition stated
(`94_caps-and-incomplete-scope.md:184`–`:205`). Verified: `94_caps-and-incomplete-scope.md:201`–`:205` reads *"No cap is
recorded as lifted."*

**`OI-S5-3` appears in none of the four, by decision.** It is the C010-internal *invariant published
unexercised against a real matrix* item, resolved inside C010 by `SUB-14 of C010`'s Census A. This
package does not touch it. The non-classification is recorded explicitly so its absence is a stated
decision rather than an omission.

### 3.2 Seven further touched ids, classified **here** rather than inherited

The charter's enumeration is *"the set of touched ids known at charter time, not a closed list"*
(charter assumption 51). Seven touched C010 residual ids are not in it. Under the rule, each is
classified at assembly on the same four-class test — **not** reported as a mismatch. All seven land in
**consumed-from**: each is cited as context or authority, and none is owned, resolved or supplied-to by
this package.

| Id | What it is in C010 | C010 owner | Class |
| --- | --- | --- | --- |
| `CAP-S1-3` | *"`qa-execution:engine` is unconfigured, so no QA pass exists"* (`../C010-system-and-repository-architecture/91_caps-and-incomplete-scope.md:85`) | `NEU-986` (`SUB-12 of C010`) | consumed-from |
| `CAP-S10-1` | Hosting, TLS, backup and monitoring not discoverable (`:369`) | the operator, reconciled at `NEU-896` | consumed-from |
| `CAP-S12-5` | `NEU-983`'s unidentified verification `PARTIAL` (`:458`) | `NEU-896` | consumed-from |
| `F-S10-6` | `DR-C10-S6-1`'s *"all 45 categories"* headline vs. the republished matrix (`../C010-system-and-repository-architecture/02_findings-register.md:789`) | `SUB-6 of C010 (NEU-976)` | consumed-from |
| `F-S14-1` | `I3`'s *"at or below the port boundary"* unsatisfiable for the 15 port-less categories (`:385`) | C010's SUB-14 | consumed-from |
| `A-25` | Tutoring needs per-learner interaction state (`../C010-system-and-repository-architecture/93_stand-in-assumption-register.md:59`) | C010 | consumed-from |
| `A-29` | Handoff as a bounded, expiring, revocable envelope (`:119`) | C010 | consumed-from |

**Total classified: 23 ids — 16 from the charter's enumeration, 7 at assembly. `0` in two classes,
`0` in none.** No split-fidelity mismatch.

**`CAP-S1-3` is the consequential one, and it is a finding.** Three published statements say the id is
*"a phantom"*, *"defined nowhere"* and *"was never defined and is void"*. **It is defined** — in C010,
at the citation above, about **exactly** the subject the four C011 records cite it for. Raised as
`F-S17-2`.

---

## 4. The citation audit

### 4.1 The gate, armed

`CAP-S1-2` is discharged: C011 is in the `GATED` list at `scripts/check-citation-paths.ts:23` (the
array opens at `:21`). Run at this cutoff:

```
PASS  C011-safe-production-integration-and-learner-isolation
      77 files · 0 non-resolving · 0 exempted by design
```

Exit `0`. **This audit does not quote the gate's total-citations or total-resolving figures**, for the
reason `00_method-and-provenance.md:280`–`:282` gives and this file inherits: they count tokens inside
the package, so a sentence quoting them is falsified by having been written. The load-bearing number
is **0 non-resolving**, which is stable.

### 4.2 Every codebase claim resolves — the blocking class, tested

The charter makes *"a broken citation to a codebase claim"* one of three classes that block the
discharge declaration. Tested directly rather than inferred from the gate, because the gate does not
range over `src/` paths at all — they are an **excluded class** (`README.md:151`–`:152`).

Every repo-root-relative non-research path cited anywhere in the package (`src/`, `drizzle/`,
`scripts/`, `tests/`, `docs/`, `.github/`) was extracted mechanically and resolved against the
worktree at `5f8e9cb`:

**103 distinct codebase-path targets cited. 103 resolve. `0` do not.**

Three load-bearing facts were additionally read at the line, not taken on citation:

- `package.json:48` is `"db:studio:prod": "dotenv -e .env.prod -- drizzle-kit studio"` — **confirmed**:
  a CRUD GUI against production credentials, outside every confinement mechanism the package designs.
- `src/transport/main.ts:55`–`:59` constructs a bare `StdioServerTransport` and nothing else —
  **confirmed**.
- `src/transport/http.ts:176`–`:182` is the only site constructing either pg transport —
  **confirmed**. So *"under STDIO no audit or event row exists at all"* holds, and a count-based gate
  is **undefined** on STDIO rather than zero.

**The blocking class is clear.**

### 4.3 The three checker blind spots, re-derived rather than inherited

A green summary is not evidence. All three were re-derived independently at this cutoff against
`scripts/citation-paths/checker.ts`, and all three reproduce:

1. **The `…` shorthand is silently exempt.** `checker.ts:121` returns `null` for any candidate
   containing `…` or `...`, and `:123` for any containing whitespace — **before** `citationsSeen` is
   incremented (`:198`–`:201`). Such refs are never counted and cannot fail.
2. **`MISSING-target` can never fail and is never printed.** The bucket is built at `:247`–`:266`;
   `isFailing` (`:342`–`:346`) tests only `inScope` and `staleNonClaims`. Confirmed further:
   `scripts/check-citation-paths.ts` reads `p.excluded` in **neither** its console nor its `--json`
   output, so the bucket is invisible in both modes, not merely non-failing.
3. **Hyphenated ranges are mis-bucketed.** `normalizeCandidate`'s stripper is
   `(:\d+(?:,\d+)*)+$` at `checker.ts:130`; it handles `:60`, `:60:4` and `:52,183` but not `:8-9`.
   Re-derived over C011: **13 distinct `src/…:N-M` targets over 10 distinct files**, every one of which
   exists. **SUB-14's figure reproduces exactly.** The class is mis-bucketed; a *wrong* `src/` path
   written with a range would be invisible.

**Reported, not fixed.** Changing `normalizeCandidate` is a behaviour change to a shared CI gate and
needs its own test case. It is out of scope by constraint and is routed, not repaired — `F-S17-6`.

### 4.4 The `MISSING-target` bucket, read entry by entry

Re-derived by running the checker's own `checkPackage` over the package rather than by
re-implementation. **Measured over the published package as it stood at `5f8e9cb`, before this file was
added: 265 occurrences over 76 distinct targets.**

The figure is stated with its corpus because it cannot be stated without one. SUB-14 reported
**235 over 73**, explicitly scoped to *"the assembly input — the fourteen merged chapters as received"*,
and said in terms that the published figure is higher and is deliberately not quoted because quoting a
target changes the count. **Both figures are correct over their own corpora, and the difference is the
assembly chapter's own quotations — exactly as predicted.** This is not a discrepancy and is not filed
as one. This file adds further occurrences by the same mechanism, which is why its own measurement is
pinned to a commit that predates it.

**All 76 distinct targets were judged individually. Zero are unreported broken citations.** They fall
in six classes: protocol and prose nouns (`tools/call`, `origin/develop`, `n/a`, …); bare source
basenames named in prose after a full-path introduction; two gitignored-charter references; three
extension-less decision-record refs; the 13 hyphen-range `src/` targets of §4.3; and the deliberately
wrong C010 filename of §4.5.

**SUB-14's "zero unreported breaks" reproduces.**

### 4.5 The two near-misses SUB-14 deliberately left — both correct

**(a) The wrong C010 filename is correctly left.** `07_the-rollout-sequence-and-what-each-stage-cannot-undo.md:654`–`:658`
cites `DR-C10-S8-2_token-bound-identity.md`, which does not exist; the real file is
`../C010-system-and-repository-architecture/decision-records/DR-C10-S8-2_token-bound-identity-over-per-call-identity.md`.
**This audit agrees it must not be repaired.** The chapter quotes the wrong name *in order to
demonstrate* that a plain wrong filename is invisible to the gate; a repaired citation is
byte-identical to one that was never broken, so repair destroys the evidence. The deliberateness is
stated twice — in the chapter itself and at `00_method-and-provenance.md:373`–`:386` — and it buckets
as `MISSING-target`, which is not gated. **Verdict: leaving it was right.**

**(b) The extension-less decision-record refs are correctly left, and the two figures are both
right.** `00_method-and-provenance.md:370` reports **3** under a column headed *"Distinct targets"*; `00_method-and-provenance.md:543` says
*"The four extension-less decision-record references"*. Both are correct under their own units:
**three distinct targets** (`DR-C11-S13-1`, `DR-C11-S9-1`, `DR-C11-S9-3`) across **four citation
sites** (`90_outcome-register.md:1106`, `:1245`; `97_package-completeness-gate.md:380`;
`13_the-ddl-the-migration-plan-and-the-runbook.md:1507`). An earlier pass of this audit read the pair
as a contradiction and **withdrew the finding on checking the units** — recorded here because a
withdrawn accusation is as much a result as a filed one. **Verdict: leaving them was right**; the shape
was examined and defended once, and none masks a broken corpus citation.

### 4.6 `96_:507` — still there, still disclosed

`96_spike-register.md:507` is the `| **Routes to** |` row of `SPK-S8-1`'s entry table and reads
*"…**SUB-12** (NEU-1004)…"*. **SUB-12 is NEU-1005.** The id is wrong.

**Confirmed present, and confirmed disclosed.** The disclosure is at
`00_method-and-provenance.md:548`–`:557`, which names the entry, states that it is *"left uncorrected
on purpose"* because SUB-14's scope forbids editing a spike entry body, and routes it to **SUB-1
(NEU-993)** as the register's content owner, co-named SUB-8 (NEU-1002) and SUB-17.

**Verdict: routing rather than fixing was right.** SUB-14's own scope is explicit that it *"does not
add, edit, re-word or re-scope a spike entry"*, and the same scope is why the three heading **markers**
in that file could be normalised while this **content** id could not. A pass that had corrected it
would have exceeded its authority to fix a one-word defect and made the boundary unauditable. The
disclosure names the entry rather than the line number, which is the more durable form. **This audit
inherits the routing and cannot discharge it: SUB-1 has shipped.** It becomes a named residual —
`F-S17-7`.

---

## 5. The risk-register audit

**Method.** Every entry in `92_risk-register.md` parsed mechanically for the four required fields, then
the entry set checked against the charter's fifteen § Risks rows.

| Measure | Result |
| --- | --- |
| Entries in the register | **53** (49 at assembly + this sub-task's 4) |
| Entries missing a severity, a mitigation, a named owner or an escalation route | **0** |
| Entries authored in a `### SUB-14` section | **0** — assembly authored none, as charter assumption 46 requires |
| Charter § Risks rows with an entry | **15 / 15** |
| Rows lacking an entry, reported as a routed gap | **0** |

**Author coverage matches the charter exactly:** SUB-1 ×3, SUB-3 ×2, SUB-5, SUB-6, SUB-7 ×2, SUB-9,
SUB-11 and SUB-17 ×4 — the allocation `92_risk-register.md:40`–`:42` names. Each entry names the
sub-task that authored it; none is attributed to its aggregator.

**One false positive, declined.** A first mechanical pass flagged `R-S12-1` … `R-S12-5` as missing
three fields each. Reading the entries showed SUB-12 writes `**Owner.**`, `**Escalation route.**` and
`**Mitigation.**` with a terminal period rather than a colon. **All fields are present; the matcher was
wrong.** Recorded because an audit that reports its tool's failures as its subject's is the defect it
exists to catch.

**The `F-S3-3` allocation is correct, and the transposition claim holds — with two corrections to how
it is described.** The charter's § Risks rows 10, 11, 12 are legal determination (Medium, OUT-9),
compatibility contract (High, OUT-16), lifecycle half (High, OUT-9). All eleven entries authored before
assembly already agreed with charter position. Independently corroborated: SUB-12 read the charter
directly and enumerated all fifteen owning outcomes at `92_risk-register.md:870` in the **corrected**
order, from the charter, without seeing the index table. Two descriptive corrections, filed as
`F-S17-8`:

- It is a **3-cycle**, not a transposition. `F-S3-3` itself uses the accurate word, *"permutation"*.
- **The charter does not carry the permutation.** `00_method-and-provenance.md:167`–`:169` and `92_risk-register.md:46` both say so
  correctly; the brief-level shorthand *"charter → decomposition → tracker → table"* is wrong at its
  first term. The chain begins at the decomposition. Relatedly `00_method-and-provenance.md:168` says *"**Four** artifacts
  downstream of the charter carry the permutation"* where **three** distinct artifacts do — the
  decomposition (twice), the tracker description, and the index table. Four occurrences, three
  artifacts.

**One declared divergence, met rather than discovered.** `00_method-and-provenance.md:91`–`:105` reports that `F-S3-3`'s
body in `91_findings-register.md` still reads live and `A-S11-1` in `95_stand-in-assumption-register.md` carries no discharge
record, because SUB-14 could resolve the conflict without authority to rewrite the entries recording
it, and routes it here. **This audit confirms the divergence is real and still open.** It is correctly
declared; it is not repairable here for the same reason; it becomes a named residual, `F-S17-9`.

---

## 6. The outcome-register audit

| Measure | Result |
| --- | --- |
| `OUT-n` rows in `90_outcome-register.md` | **20 / 20** — OUT-1 … OUT-20 |
| Rows carrying a **success measure** | **20 / 20** |
| Rows carrying resolving evidence and a measured result | **20 / 20** |
| Measures authored at assembly (SUB-14) | **0** |

**20/20 is reachable at this position and was not at SUB-14's**, which could report only 19 plus the
slot. OUT-20's row is appended by this sub-task in `90_outcome-register.md` § SUB-17 and is the
twentieth.

Every measure is recorded by the sub-task that produced the outcome — verified per row against its
`Authored by.` line. **A measure recorded as NOT MET is still a measure**, and three are: OUT-5's
measured result, SUB-5's limb 2 on its literal figure, and `G-S5-6`. None was restated to fit its
outcome, which is the property this audit is checking for and the one most easily faked.

---

## 7. The band-completeness check

| Measure | Result |
| --- | --- |
| Registers present in the `90`–`99` band | **8 / 8**, plus this audit record at `98_` |
| Minted ids appearing as an entry in **more than one** register | **0** |
| Ids appearing in more than one register with a **differing owner or status** | **1 declared divergence** (§5) |

**Every per-register count re-derived independently at this cutoff and every one reproduces:**
`90_` **19** (now 20), `91_` **88**, `92_` **49** (now 53), `93_` **34**, `94_` **13**, `95_` **22**,
`96_` **33**, `97_` **149 rows**. Band total **407 entries / 406 minted ids** — reproduces.

**33 spikes, zero executed — reproduces.** Every one of the 33 `Result` fields reads *not executed* or
records no observation. **`observed-in-production` is applied to zero claims package-wide** — every one
of its ~40 occurrences is a statement about the label's emptiness, never an application of it.
**No number in this package has quietly become a measurement.**

**124 C010 id collisions — reproduces exactly**, family by family: 52 `F-`, 25 flat `G-`, 19 `OI-`,
12 `CAP-`, 12 `OUT-`, 4 `SPK-`. `OUT-1`…`OUT-12` and `G-1`…`G-25` are all in the set, and the governing
bare-id rule at `README.md:131`–`:136` now covers every family.

**The findings-register enumeration reproduces in both directions: 11 and 11.** Charter assumption 43
(`01_charter.md:645`) names OUT-2, OUT-3, OUT-4, OUT-8, OUT-9, OUT-10, OUT-11, OUT-12, OUT-14, OUT-17
and OUT-18. Every named outcome carries the requirement in its own text (11/11) and every outcome whose
text carries it is named (11/11). SUB-14's correction of the decomposition's attribution — 49 names
only nine — is confirmed against the charter.

**`46 / 43 / 3` re-derived from source at this cutoff:** `registerTool(` occurs **46** times across
`src/server/`; `EXCLUDED_TOOLS` (`src/transport/context-token-middleware.ts:5`–`:9`) holds exactly
three. **`42` is asserted as a tool-surface count in zero places** — every occurrence names it as the
superseded miscount. The blocking condition is clear.

**And the line-number claim is correctly *not* made.** A `:42` token occurs **62** times across **27**
of the merged files. The package publishes that figure rather than denying it, which is right. One
sentence overreaches and is `F-S17-3`.

---

## 8. The independent cold read

**Method.** An implementation agent with **no access to `_local/` or `docs/wf-plans/`**, working only
from the published package and the repository paths it cites. It began at `README.md`, followed the
stated reading order, and was asked one question: *can an implementer reconstruct every decision, its
evidence and its rejected alternatives from the package alone?*

### 8.1 The verdict on the criterion, and the verdict overall

**On the criterion the charter sets — PASS.** An implementer can reconstruct every substantive
decision from the package alone. The cold read walked all **37** decision records and reports that
**every one** states a decision, enumerates rejected alternatives **with reasons**, and grounds its
rationale in reachable evidence; that **none** rests on a tracker issue for its content; and that the
identity rule, the STDIO gate and token row, the enforcement point and its first `holds` derivation,
the per-table disposition, the ten-stage order, the propagation matrix and the DDL/migration/runbook
are each reconstructable and evidenced against real repository lines.

**Overall — PARTIAL**, on a different axis: the accuracy of figures the package states **about
itself**. Its summary is worth quoting because it is the sharpest statement of this package's actual
shape: *"treat every number the package states **about itself** as unverified; treat every number it
states **about the codebase** as reliable."*

**This is not a failed cold read**, and the distinction is load-bearing because a failed cold read is
one of the three classes that block the discharge declaration. The charter's criterion is
reconstructability, and reconstructability passed. The PARTIAL is bookkeeping, every instance of it is
now a registered finding with an owner, and none of it undermines an engineering conclusion.

### 8.2 Five findings the cold read raised and this audit withdrew

Recorded because a withdrawn accusation is as much a result as a filed one, and because the reason is
instructive.

**The package changed underneath the reader.** Two of this sub-task's own commits landed mid-read,
adding `98_audit-record.md`, `92_risk-register.md` § SUB-17 and `91_findings-register.md` § SUB-17.
The cold read initially reported the band total as 411 against a published 406, the risk register as
53 against a published 49, `98_audit-record.md` as an unresolvable reference, and a contradiction on
the four reserved slots — and called the register discrepancy *"the single most damaging finding"*.
**All five were artifacts of reading a moving tree.** Re-checked at `6d981bf`, the publication commit:
`92_` carries **49** entries with zero `### SUB-17` section, `91_` carries **88**, and no
`98_audit-record.md` exists. **`README.md:98`–`:109` and `00_method-and-provenance.md` §3 are
accurate**, and the cold read retracted all five itself before reporting.

The episode is the reason this audit pins every self-referential measurement to a **named commit that
predates the measurement** (§4.4), and it is a live demonstration of the defect class SUB-14 diagnosed:
*a figure measured over the package and quoted inside it is falsified by the act of quoting.* Here it
was falsified by the act of **auditing**.

### 8.3 What the cold read found that survived verification

Seven findings, each **re-verified against the file by this sub-task** before filing — `F-S17-15` …
`F-S17-21`. The four that most affect a reader:

- **Ten places tell the reader the CI citation gate does not cover this package.** It does, armed by
  the publication commit itself. `F-S17-15`.
- **Three `package.json` line citations are wrong by exactly 19 lines**, including the row `12_threat-model-and-the-gates-that-authorize-implementation.md`
  calls *"the most consequential single row in this chapter's operator model"* — and `package.json`
  was byte-identical at that chapter's own commit, so they were wrong when written. `F-S17-16`.
- **There is a fourth checker blind spot**, and it is the one that produced the third finding: the gate
  resolves a citation's **path** and never checks its **line content**. `00_` §4.5 enumerates three and
  treats the list as closed. Four stale `README.md:NN` citations, created when the README was
  superseded wholesale, are invisible to it — one quoting text no longer in the file. `F-S17-17`.
- **The bare-id rule is stated in three incompatible forms**, and it is the package's only mechanism
  for disambiguating 124 id strings defined in both packages. `F-S17-19`.

**Two reconstruction gaps it reports were already registered and routed by the package itself** —
`F-S13-11` (which stages the disable-path control governs) and `F-S13-1` (whether `session_chunks`
carries its own key). Both are disclosed in `00_` §7.2 as deliberately unactioned because their owners
had shipped. They are not new, and they are not counted twice.

### 8.4 Vocabulary — `R15` measured against a reader rather than an author

The cold read is where the vocabulary-collision risk is tested from a reader's position. It found
`subject`, `session` and `context token` **disambiguated wherever they carry the mechanism**, and no
place where an unqualified use changed the meaning of a decision. It also found the terms genuinely
live in more than one sense across chapters — `subject` in a JWT, actor, academic and subject-matter
sense; `session` in a learning, transport and database sense — and several short id families reused
across chapters (`C1`–`C5`, `T1`–`T7`, `R1`/`R2`). `docs/GLOSSARY.md` carries rows for the terms the
package **introduces**; it does not carry rows for several it **inherits and leans on**. This is
recorded in `R15`'s mitigation status as a partial mitigation with a named residual rather than filed
as a finding, because no instance was found where a reader was actually misled.

---

## 9. The findings this audit raised

**Twenty-one**, `F-S17-1` … `F-S17-21`, in `91_findings-register.md` § SUB-17. Fourteen from this
sub-task's own passes; seven from the cold read, each re-verified here before filing.

**None is repaired.** Each names its owning sub-task, and each is carried as a named residual in
`94_caps-and-incomplete-scope.md` § `CAP-S17-1` with its owner.

**By class**, against the defect classes this package produces:

| Class | Count | Examples |
| --- | --- | --- |
| False self-certification — a count or completeness claim asserted rather than tested | **8** | `F-S17-1` (11 + 2 ≠ 14), `F-S17-3` (55 is 57), `F-S17-4` (a `:42` denial containing one), `F-S17-5`, `F-S17-10`, `F-S17-11`, `F-S17-20`, `F-S17-6` |
| A misattributed line number under the claim it evidences | **2** | `F-S17-16` (three `package.json` sites), `F-S17-18` (the fifth escapee, in the handover paragraph) |
| An enumeration a differently-shaped search would extend | **4** | `F-S17-2` (a search confined to C011 cannot see C010's cap), `F-S17-15` (ten unswept sites), `F-S17-17` (a fourth blind spot), `F-S17-21` (filename collisions, not just id collisions) |
| A stated rule that is not applied where it was said to be | **3** | `F-S17-7`, `F-S17-8`, `F-S17-19` |
| Declared-and-unresolvable, inherited from an earlier pass | **3** | `F-S17-9`, `F-S17-12`, `F-S17-13` |
| Reported-not-fixed, by constraint | **1** | `F-S17-14` |

**Zero are engineering defects.** Every one is a defect in what the package says **about itself** —
which is the surface this audit ranges over, and also, on the cold read's evidence, the only surface on
which this package is unreliable.

---

## 10. The re-audit log

Per routed finding: its owning sub-task, its round, its final state.

| Findings | Owning sub-tasks | Round reached | Final state |
| --- | --- | --- | --- |
| `F-S17-1` … `F-S17-21` (all 21) | SUB-1, SUB-2, SUB-3, SUB-5, SUB-7, SUB-8, SUB-9, SUB-11, SUB-12, SUB-14, SUB-16, and the creator as sole maintainer | **1 of 2** | **routed; not repaired; not re-audited** |

**No finding reached round 2, and none was closed.** The loop's premise — a re-openable owner — is
false at position 16, and this sub-task may not repair in an owner's place. Recorded as
`CAP-S17-1` with one shared non-convergence reason, and as `G-S17-21` **not met** on the gate.

**What was re-run, and what it changed.** Two audits were re-run within this sub-task against its own
first pass rather than against repaired content: the risk-register field check, after its first
mechanical pass produced five false positives against SUB-12's entries (declined on reading the file,
§5); and the `:42` and extension-less-DR-reference checks, after a first reading treated two correct
figures stated in different units as a contradiction (withdrawn, §4.5). **Both re-runs changed this
audit's own output and neither produced a finding against the package.** They are logged because an
audit that reports only what it found, and never what it withdrew, is not reporting its error rate.

**And a third, which is the sharpest evidence in this file that the armed gate is worth having.** This
sub-task's first draft wrote **61** path references using the `…md` shorthand — the exact form
`F-S17-8` faults `00_method-and-provenance.md` for, written by the audit that filed it. All 61 were
expanded to full filenames rather than exempted, because an audit may not claim a convention it does
not keep. **The expansion introduced three broken citations**, all inside `F-S17-21` — the finding
*about* cross-package filename collisions — where C010's register filenames were written bare and
resolved against C011's directory. **The newly armed gate failed the build and named the file**; they
were repaired and the gate returned `0 non-resolving`. One further defect the gate could **not** see
was caught by reading: the mechanical expansion had flattened a sentence whose whole subject was the
ambiguity of the two-digit shorthand, turning the example into the thing it was contrasting with.

Three lessons, and they are the package's own in miniature: the shorthand is easy to write without
noticing; a mechanical repair introduces defects at the rate a mechanical anything does; and **the
gate catches the path class and nothing else** — the semantic corruption was invisible to it, exactly
as `F-S17-17` describes.

---

## 11. The declared exit state

**Exactly one state is declared, and it is:**

> ## **AUDITED WITH NAMED RESIDUAL**

All six audits ran to completion. **Twenty-one findings are outstanding**, each enumerated with its
owner in `94_caps-and-incomplete-scope.md` § `CAP-S17-1` and reflected on the completeness gate at
`97_package-completeness-gate.md` § SUB-17, where **two rows read `not met`**.

### 11.1 The three blocking classes, each tested

The charter names three classes that are **never** eligible for the residual state and block the
discharge declaration until repaired and re-audited to clean. Each was tested, and the reasoning is
given so a reader can disagree with an argument rather than an omission.

**1. A split-fidelity mismatch — none.** 8/8 List B answered, 0 List A claimed, 0 ids in two classes,
0 ids classifiable into none (§2, §3). Seven ids absent from the charter's enumeration were classified
at assembly under charter assumption 51's open-enumeration rule, which the charter states explicitly is
**not** a mismatch. `DR-C10-S5-2`'s revision trigger did not fire.

**2. A broken citation to a codebase claim — none, and this required a judgement that is stated
rather than assumed.** The armed gate reports **0 non-resolving**, and **103 of 103** distinct
codebase-path targets resolve. `42` is asserted as a tool-surface count in **zero** places.

But `F-S17-16` establishes three `package.json` citations whose **path** resolves and whose **line**
holds something else. **Does that block?** The stricter reading says a citation pointing at the wrong
line is broken, and on that reading the declaration is withheld. **This audit does not take that
reading**, for a stated reason: the charter's own success criterion for this audit is *"every codebase
claim… **resolves to a real path** at a stated cutoff"*, which is a path-level test, and all 103 pass
it. The underlying codebase facts are true and are correctly cited elsewhere in the package —
`db:studio:prod` at `package.json:48` in `00_method-and-provenance.md:667`, verified here at the line. So what is defective
is three pointers to a sound claim, not the claim.

**The counter-argument is real and a reader may prefer it.** It is recorded here, with the finding, so
that preferring it requires only rejecting one stated inference rather than discovering an unstated
one. If the stricter reading is taken, the declaration below is withheld until SUB-12 and SUB-1 repair
three line numbers and this audit's §4.2 is re-run.

**3. A failed cold read — none.** The cold read **passes the criterion the charter sets**: every
decision, its evidence and its rejected alternatives are reconstructable from the package alone, across
all 37 decision records. Its overall PARTIAL is on the accuracy of the package's self-referential
figures, every instance of which is now a registered finding with an owner (§8.1).

**None of the three blocking classes is triggered.** The twenty-one outstanding findings are all in the
one class the charter makes eligible for the residual state, or are bookkeeping defects of the same
kind.

### 11.2 The discharge declaration

> **The C011 package is DISCHARGED WITH NAMED RESIDUAL.**
>
> Handed to **`NEU-896`** as the convergence gate, and to **C010's `A-28` re-check**, whose trigger —
> *"NEU-893 lands"* — is fired by this publication.
>
> **What is handed over checked:** the eight-register band, complete and internally unique across 406
> minted ids; all fifteen charter § Risks rows authored by their named authors; all twenty outcome rows
> carrying a success measure recorded by its producing sub-task; 8/8 List B answered and 0 List A
> claimed; every touched C010 residual id in exactly one of four classes; every codebase path
> resolving; `42` asserted nowhere as a codebase fact; and a package a cold reader can reconstruct
> every decision from.
>
> **What is handed over outstanding:** the twenty-one findings of `CAP-S17-1`, each with a named owner;
> the two `not met` gate rows, of which **`G-S17-16` — the absent SUB-7 gate section — no remaining
> party may fill**; and the standing evidence position that nothing in this package has been executed,
> observed or applied.
>
> **What this declaration is not.** It is not a statement that the package is correct as engineering,
> and it is not a go decision — `NEU-896` owns that. It is a statement that the package's remaining
> defects are **named** rather than asserted away.

### 11.3 The one thing a reader should carry away

The package's codebase claims are reliable and its claims about itself are not, and the second is
where every finding above landed. That asymmetry is not an accident: fourteen authors wrote
append-only in parallel, nobody could correct anybody, and every figure any of them stated about the
package as a whole was true at a cutoff and false soon after. SUB-14 diagnosed the mechanism exactly —
*a figure measured over the package and quoted inside it is falsified by the act of quoting* — and
then stated four more such figures. This audit found that, and then reproduced the same failure in its
own first draft twice (§10). **The remedy the package converged on is the right one and was applied
unevenly: state the corpus and the commit with every self-referential figure, or do not state the
figure.** Where that discipline was followed — `00_` §4.4's refusal to quote the published
`MISSING-target` total, §4.5's refusal to quote the citation totals — no defect was found.
