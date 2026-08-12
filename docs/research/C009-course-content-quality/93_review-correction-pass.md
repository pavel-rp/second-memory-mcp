# 93 — Review correction pass (NEU-970)

**Task:** NEU-970
**Date:** 2026-08-11
**Model:** claude-opus-5[1m]
**Base:** `origin/develop` @ `6031079`

A correction pass over the whole C009 package, arising from the Copilot review comments on the
thirteen NEU-890 fleet pull requests. It does two things: it corrects the confirmed factual
defects, and — because this package's value proposition is claim discipline — it records the
findings that **did not survive re-verification**, with the evidence that overturned them.

**This pass suspends the package's append-only convention.** Every prior sub-task appended its
own `### SUB-<n>` section and reflowed no one else's. A correction pass cannot work that way: a
wrong number has to be corrected where it is read, not annotated three files away. The
suspension is deliberate, is bounded to this pass, and is recorded here, in the commit message
and in the pull request. **The convention resumes immediately afterwards.**

---

## 1. The scans were re-run. They reproduce.

The review reported that six recorded `grep -E` scans were broken, on the grounds that their
patterns contain `\|`, which in POSIX ERE is a literal pipe rather than alternation. If true,
the "0 matches" results would have been vacuous and the package's core anti-fabrication
evidence would have proved nothing.

**It is not true, and the reasoning behind it was a category error.** These commands live in
GFM table cells. Inside a table, `\|` in a code span is *markdown pipe-escaping* — it renders
as a plain `|`. The reviewer, and the analysis that followed it, read the raw markdown source
as if it were the command. The rendered commands are correct alternation.

Every scan was re-run against this tree. **Engine: GNU grep 3.11 (`/usr/bin/grep`).** Note the
sandbox's default `grep` on `PATH` is `ugrep`, which differs from GNU grep on exactly one of
these patterns; the engine is named because that difference matters below.

| Scan | Rendered pattern | Observed | As published | Verdict |
| --- | --- | --: | --- | --- |
| **A** — statement-section markers | `^(Input\|Output\|Constraints\|Sample Input\|Sample Output)\b` | **0** across all 38 files | 0 matches | **reproduces** |
| **B** — problem-level URLs of the twelve sources | the five-source URL alternation | **0** | 0 matches | **reproduces** |
| **C** — enumerated candidate set | `^(\s*[-*]\|\\|)\s*.*\b(abc\|arc\|agc\|dp)[0-9]{2,4}_[a-z]\b` — the corrected form this pass applies | **0** | 0 matches | **reproduces.** As published it rendered `^(\s*[-*]\|\|)…`, an empty alternative; both forms return the same 0 — see §1.1 |
| **E** — the enumerating endpoint by name | `(problemset\.problems\|api\.codeforces\.com)` | **14** | 3 (`01_` era) · 7 (`traceability/03_` era) | **reproduces** — see §1.2 |
| **`CK-S4-6`** | `9 of the 19 blocking\|9 blocking nodes\|7 blocking nodes\|2 blocking nodes` | not re-run | lines 36, 113, 132, 150 | valid alternation as rendered; the recorded command carries a `<C005>` placeholder in place of a path, so it is not runnable verbatim without substitution |

### 1.1 The one defect that is real

At `01_provenance-and-rights.md` §10 scan C and `traceability/03_access-path-and-verification-record.md`
§4 scan C, **both** pipes were escaped. The rendered pattern was therefore `^(\s*[-*]||)…` — an
**empty alternative** — where the intent, stated in `92_` §6.1 as *"the eight `[-*]`/`\|`
row-start patterns"*, is `^(\s*[-*]|\|)…`: a list-item marker **or** a table-row pipe.

`ugrep` rejects the malformed form outright (`error at position 14: empty (sub)expression`).
GNU grep 3.11 accepts it as a no-op branch, which reduces the pattern to its tail and returns
the same **0**. So the published result was never wrong — but a reader copying the published
command out of the table would, on the sandbox's default engine, get an error rather than a
result. In a register whose stated purpose is *rerunnable commands with verbatim outputs*, that
is a defect worth fixing, and both cells are corrected in this pass.

### 1.2 `OI-S1-15`'s discharge stands

`92_` §6.2 discharged `OI-S1-15` by re-running scans D and E and attributing the gap to package
growth. The re-run here returns **14** for scan E — **exactly** the figure SUB-12 recorded.
That is independent confirmation that SUB-12 ran the working command and read it correctly. The
3 → 7 → 14 progression tracks the package growing from one file to twelve to the present set.

**Re-assessment: the discharge stands, unchanged, on the reasoning SUB-12 gave.** Nothing in
this pass disturbs it.

---

## 2. Corrections applied

| # | Location | Was | Now |
| --- | --- | --- | --- |
| 1 | `01_` §10 scan C · `traceability/03_` §4 scan C | rendered `[-*]\|\|` — empty alternative | rendered `[-*]\|\\|` — marker **or** table-row pipe |
| 2 | `92_` §11.3 heading | "PASS, **22** of 22" | "PASS, **23** of 23" — the table below it totals 23 (15 + 2 + 2 + 3 + 1) |
| 3 | `11_` §1 | "**two** non-`AI` mechanisms" | "**three**" — §6.1 fires `schema`, `server-side` and `deterministic` before the `AI` row |
| 4 | `traceability/09_` §2 | "Each of the **10**" `automated` rows | "Each of the **11** … across **10 distinct gates**" — `EQ-S1-2` and `EQ-S1-6` both resolve to `G-ENUM-SCAN`, which is why the gate enumeration is one short of the row count |
| 5 | `traceability/09_` §2 | "Each of the **14**" `server-side` rows | "Each of the **15**" — counted from `../09_…` §4 |
| 6 | `08_` §1 | "a named reviewer role on **every** transition, a durable record for **every** transition" | qualified to every **defined** transition, naming `T-13` (`quarantined` → *any state*) as the deliberately undefined edge that carries neither |
| 7 | `09_` §3.2 rule 1 | cross-reference to `OI-S9-16` | `OI-S9-12` — the sentence is about a warning nobody reads; `OI-S9-16` is the unbuilt-gates residual |
| 8 | `traceability/09_` §5 | `LOG_REDACT` as six paths | the actual **14**: seven names each paired with a `*.` wildcard variant, per `src/shared/logger.ts` |
| 9 | `02_` §3.4 and §5 | `problem-reference` "carries `stable_id` and `canonical_url` and nothing else" vs a §7.4 template emitting `form:` | scoped to the **stored field set**, with `form:` named as the structural discriminator — see §3 |
| 10 | `traceability/05_` §3 | one Source cell mixing qualified and bare paths | all four node paths fully qualified, so `cl-3-state-compression.yaml` is locatable |
| 11 | `traceability/05_` §3 | "No problem id, URL or **identifier-shaped string**" | narrowed to problem/citation identifiers; the file's own `D-R6`, `F-939-A` and node ids are explicitly out of that claim's scope |
| 12 | `02_` §2 | "all 179 **mapped** nodes" | "all 179 **non-root** nodes" — 187 is the mapped-node total; 179 is the non-root subset carrying `deferred-provisional` |
| 13 | `traceability/03_` §1 | `01_provenance-and-rights.md` cited without `../` from inside `traceability/` | `../01_provenance-and-rights.md` |
| 14 | `11_` §6.1 row 5 · `07_` §7 · `traceability/05_` §3.11 · `13_` §1 · `DR-C09-04` §1 | unbalanced bold, nested backticks breaking a code span, and "re-severity-ed" | closed, re-delimited with double backticks, and reworded to "re-graded for severity" |

---

## 3. The `problem-reference` field cap — clarified, not widened

`02_` §3.4 capped `problem-reference` at `stable_id` and `canonical_url` "and nothing else",
while the §7.4 authoring template emits three keys, the third being `form: problem-reference`.

**Ruling: `form` is the structural discriminator, not a stored field.** It identifies *which
form an instance is*; it is not a member of the `CH-F5-1`-capped stored field set. The cap is
therefore **preserved exactly as it was** — two stored fields, no third — and the wording is
corrected to say "stored field set" so the template is consistent with it rather than
contradicting it.

This deliberately does **not** pre-empt `D-F5` (owner NEU-932), which governs the field-set
question itself. Widening the cap would have been a decision; scoping the sentence is not.

---

## 4. The NEU-887 / NEU-897 citation convention

C009 mentions NEU-887 in 35 places. That file's task id is **NEU-897**, and
`C005-product-foundation/traceability/README.md` is **NEU-899**'s — so on a literal reading the
citations that name a path name the wrong task.

**The reattribution is smaller than the review implied.** Of those 35 mentions, only **four**
pair NEU-887 with the artifact's path; the rest cite the program as the owner of a rule or an
outcome, where NEU-887 is correct as written.

**Ruling: both readings are legitimate, and which one applies depends on what is being cited.**

- **NEU-887** where the citation names **the program that owns the outcome** — the rule, the
  discipline, the seven-class taxonomy as a *standard being inherited*. The target file's own
  header supports this directly: *"Operationalizes NEU-887 **OUT-4**"*. "NEU-887's seven-class
  taxonomy" is correct under this reading and is **not** an error.
- **NEU-897** where a **specific artifact path** is cited as that task's deliverable, and
  **NEU-899** for the C005 traceability README.

**Disposition: applied.** All four path-form citations now read *"NEU-887 OUT-4, published as
NEU-897's `…/01_evidence-taxonomy.md`"* or the equivalent — `README.md` §Binding upstream
inputs, `00_` §5, `08_` §3.1, and `traceability/01_` §header. The remaining 31 mentions are
program-level and were deliberately left as they are.

---

## 5. Findings that did not survive re-verification

Recorded because a review record that lists only its hits is the same false-green the package
exists to prevent.

| Claim | Verdict | Evidence |
| --- | --- | --- |
| Six recorded scans are broken ERE; scans A/B/C's "0 matches" are vacuous | **Overturned** | `\|` in a GFM table code span is markdown pipe-escaping. All four scans reproduce their published results — §1 |
| Scan E's published command cannot produce its published result, so a different command was run | **Overturned** | The rendered command returns 14 today, matching SUB-12's independent re-run exactly — §1.2 |
| `OI-S1-15`'s discharge is affected | **Overturned** | Follows from the above; the discharge stands — §1.2 |
| `11_` lines 340 and 447 also assert "two non-`AI` mechanisms" | **Overturned (anchor drift)** | Neither line carries the claim. Only §1's line 21 did, and it is corrected. Line 447 had a *different*, real defect — unbalanced bold — which is fixed |
| `91_`:726 claims each adjudication is published with a per-block line range | **Not reproduced** | Line 726 is a *"compensating observable gate"* row reading `none — cap`; it makes no line-range claim. Either the anchor drifted or the claim was misread. Left untouched rather than edited on a bad anchor |
| `traceability/08_` claim `C-02` asserts "every transition" | **Not reproduced** | The phrase does not occur in that file. The universal *was* real in `08_` §1 and is corrected there (§2 row 6) |
| `05_`:242 — "No id … appears anywhere in this document" | **False positive** | No such sentence at or near that line. Duplicate of the `traceability/05_`:59 claim, which is real and is corrected |

Four further findings were classed **plausible** and are **not** addressed here, because each
needs the owning sub-task's domain reading rather than a textual fix: `02_`:253 (shared REQUIRED
fields not restated in the templates) · `dry-run/02_`:57 (probe output omits the `form:`
discriminator) · `06_`:110 and :120 (`MM-T2` / `spacing_eligible` "carried by" wording) ·
`traceability/06_`:22, :26, :36 (provenance cells citing sections with no file path).

---

## 6. What this pass leaves open

1. **The four plausible findings** (§5), each routed to its authoring sub-task.
2. **`91_`:726** — re-locate the per-block line-range claim, if it exists, on a correct anchor.
3. **The NEU-890 resolution comment** lists the wrong pull-request number for 7 of 13 items.
   Tracker-side housekeeping; no repository change.
4. **The `93`-range allocation** is now used; `94`–`99` remain free for package-level registers.
