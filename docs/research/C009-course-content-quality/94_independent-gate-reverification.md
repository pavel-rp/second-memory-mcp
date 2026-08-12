# 94 — Independent package gate re-verification

**Task:** NEU-970 — independent re-verification of the C009 package completeness gate  
**Model:** gpt-5.6-sol[1m]  
**Date:** 2026-08-12  
**Commit base read:** `4bbd785f6b507c87b20b38a1b9c3da352b31c7b5`

## Result stated before the evidence

**The package does not currently satisfy its completeness gate.** This independent run found two unresolved cross-references and an incorrect mechanism roll-up in `11_package-end-to-end-proof-and-exemplars.md` §10.2. It also found several published gate figures that are stale after `93_review-correction-pass.md` landed: the pre-report package has **39**, not 38, Markdown files; the class-7 token has **28**, not 25, occurrences; and the registers now define **112** open-item ids and **64** cap ids, not 103 and 63.

The stale figures do not by themselves show lost entries: the current registers are mechanically internally complete. The rights scans found no breach. This run satisfies the package's model-independence condition: the package files name `claude-opus-5[1m]`, while this report names `gpt-5.6-sol[1m]`, and I authored none of the audited files. I report these facts only; I set no package status and close no cap.

## 1. File-set and layout completeness

**Result: CONFORMANT, with the published file count stale.**

Command/evidence:

- `find docs/research/C009-course-content-quality -type f -name '*.md' -print` returned **39 files before this report was written**.
- Root topic documents are `00`–`11` and `13`; shared package files are `90`–`93`. `12_` is intentionally unused because SUB-12's deliverable is package-level `92_`. Supporting files are contained under the declared `adjudication/`, `decision-records/`, `traceability/`, and `dry-run/` folders.
- `README.md` lines 47–54 reserves `00`–`89` for topic documents and `90`–`99` for package-level records, and expressly allocates `93_` to the correction pass. Nothing in `90`–`93` is topic content.
- `git log --format='%H' --diff-filter=R --all -- docs/research/C009-course-content-quality` returned no rename commit. I found no evidence that one sub-task renumbered another's file.
- Topic headers allocate all C009 outcomes: OUT-1=`02_`/SUB-2; OUT-2=`04_`/SUB-4 plus exemplar review in `11_`; OUT-3=`03_`/SUB-3; OUT-4=`07_`/SUB-7; OUT-5=`06_`/SUB-6; OUT-6=`05_`/SUB-5; OUT-7=`01_`/SUB-1; OUT-8=`08_`/SUB-8; OUT-9=`09_`/SUB-9; OUT-10=`10_`/SUB-10; OUT-11=`11_`/SUB-11 plus the records in `13_`/SUB-13. Each names its owning task/sub-task in its header.

**Disagreement with the published gate:** `92_` §1's 38-file figure predates `93_review-correction-pass.md`; the present pre-report denominator is 39.

## 2. House-form conformance

**Result: CONFORMANT for the checks requested.**

A recursive parser found **45 `**Model:**` lines in 39 files**, with one normalized author model id:

| Model id | Attribution-line count |
| --- | ---: |
| `claude-opus-5[1m]` | 45 |

Two lines also name a probe-subject model after the author attribution; they do not change the author model id. Every file has at least one attribution line.

All **13 root topic documents** (`00`–`11`, `13`) carry a house header and defer rather than set status. Across all 39 files, 34 carry such a header. The five without one are the four folder READMEs and package-level `93_review-correction-pass.md`; none is a topic document. `93_` line 127 says `Status: applied` about whether corrections were applied, not one of the governed `settled` / `provisional` / `unresolved` decision states, but that wording is avoidably ambiguous.

## 3. Evidence discipline

**Result: CONFORMANT for class-7 discipline and independent at the model/no-authorship level.**

Command: `grep -rnF '[future-real-user]' docs/research/C009-course-content-quality`

Raw result: **28 occurrences across 21 files**. I read every occurrence. All are prohibitions, definitions, negative assertions, or descriptions of a scan; **zero are actual class-7 claims**.

| File | Occurrences | Independent classification |
| --- | ---: | --- |
| `00_method-and-provenance.md` | 1 | prohibition/definition |
| `06_assessment-evidence-out-of-band.md` | 1 | prohibition |
| `08_authoring-workflow-and-in-situ-review-loop.md` | 1 | prohibition |
| `09_enforceable-quality-system.md` | 2 | gate prohibition and negative evidence statement |
| `10_citation-drift-detection-and-revalidation.md` | 1 | negative evidence statement |
| `11_package-end-to-end-proof-and-exemplars.md` | 4 | four expressly negative/prohibitive occurrences |
| `13_decision-risk-metric-and-prototype-records.md` | 2 | inadmissibility rule and negative assertion |
| `90_open-items-and-provisional-register.md` | 1 | description of a prior scan judgement |
| `91_caps-and-incomplete-scope.md` | 2 | negative evidence statement and scan description |
| `92_package-completeness-gate.md` | 2 | prohibition and prior result description |
| `decision-records/DR-C09-01_permitted-field-set.md` | 1 | negative evidence statement |
| `decision-records/DR-C09-02_dr-m08-routing.md` | 1 | negative evidence statement |
| `decision-records/DR-C09-04_authoring-languages.md` | 1 | negative evidence statement |
| `dry-run/06_corpus-swap-verification.md` | 1 | negative evidence statement |
| `traceability/01_rights-evidence-register.md` | 1 | prohibition/negative assertion |
| `traceability/02_form-mechanism-placement-matrix.md` | 1 | negative assertion |
| `traceability/04_standards-evidence-and-scope-audit.md` | 1 | negative assertion |
| `traceability/06_signal-gate-evidence-register.md` | 1 | negative evidence statement |
| `traceability/08_workflow-evidence-and-non-mutation-audit.md` | 1 | prohibition |
| `traceability/09_enforcement-classification-and-gap-register.md` | 1 | negative audit row |
| `traceability/11_exemplar-conformance-and-scenario-record.md` | 1 | negative count explanation |

**Disagreement with the published gate:** `92_` §3's 25 occurrences in 20 files is stale; `90_` and `91_` now repeat that stale figure, while the working tree contains 28 in 21.

**Independence:** yes under `C-3`'s model-identity test and the supplied authorship fact. `gpt-5.6-sol[1m]` differs from the sole package author model `claude-opus-5[1m]`, and I authored none of the package. Model inequality alone cannot prove a distinct human/operator or the absence of shared prompts; that limit is recorded under “What I could not verify.”

## 4. Status discipline

**Result: CONFORMANT; the node audit passes VACUOUSLY with denominator 0.**

- The local `adjudication/` folder contains only its README. I found no C009 ledger row whose status could be changed locally.
- A package-wide search for `settled`, `provisional`, and `unresolved`, followed by reading the hits, found descriptions of inherited decisions, provisional inputs, caps, and deferring headers—not a topic file promoting its own artifact. `DR-C09-04_authoring-languages.md` lines 14–16 calls an inherited charter choice settled while its header expressly says the record sets no status; this records rather than performs a status flip.
- `README.md` lines 66–68 and `00_method-and-provenance.md` lines 81 and 92 require ledger-only status changes and union/append rather than replacement.
- Mechanical scan of the five map node files found `creator_review: "deferred-provisional"` **179/179** times and no non-deferred `creator_review` value.

Therefore the audit “every node whose `creator_review` is not `deferred-provisional` has an adjudicated ledger entry whose id its notes cite verbatim” runs over **0 nodes**. It passes **VACUOUSLY (0/0)**, not substantively.

## 5. Register integrity

**Result: CONFORMANT mechanically; the figures published in `92_` are stale.**

A Node parser expanded inclusive id runs, counted each `#### \`<id>\`` definition by `### SUB-<n>` section, and compared all package-wide id citations in both directions.

### `90_open-items-and-provisional-register.md`

| Section | Entries |
| --- | ---: |
| SUB-1 | 15 |
| SUB-2 | 8 |
| SUB-3 | 5 |
| SUB-4 | 9 |
| SUB-5 | 5 |
| SUB-6 | 9 |
| SUB-7 | 8 |
| SUB-8 | 5 |
| SUB-9 | 17 |
| SUB-10 | 6 |
| SUB-11 | 8 |
| SUB-12 | 9 |
| SUB-13 | 8 |
| **Total** | **112** |

### `91_caps-and-incomplete-scope.md`

| Section | Entries |
| --- | ---: |
| SUB-1 | 6 |
| SUB-2 | 6 |
| SUB-3 | 7 |
| SUB-4 | 6 |
| SUB-5 | 5 |
| SUB-6 | 6 |
| SUB-7 | 6 |
| SUB-8 | 4 |
| SUB-9 | 7 |
| SUB-10 | 6 |
| SUB-11 | 3 |
| SUB-12 | 1 |
| SUB-13 | 1 |
| **Total** | **64** |

Integrity results for each register: duplicate ids **0**; cross-section id collisions **0**; numbering gaps **0**. Open items: **112 defined / 112 cited**, cited-but-undefined **0**, defined-but-never-cited **0**. Caps: **64 defined / 64 cited**, cited-but-undefined **0**, defined-but-never-cited **0**.

`92_` §5's 103/63 figures omit SUB-12's nine open items and one cap. The current registers are internally complete despite that stale report.

## 6. Rights obligations over the whole package

**Result: CONFORMANT under the package's lexical scans plus independent reading of every positive hit.** Scope was all 39 pre-report Markdown files.

| Scan | Regex | Raw hits | Independent adjudication |
| --- | --- | ---: | --- |
| A — statement markers | `^(Input|Output|Constraints|Sample Input|Sample Output)\b` | 0 | No breach. |
| B — problem URLs | `codeforces\.com/problemset/problem|codeforces\.com/contest/|cses\.fi/problemset/task/|atcoder\.jp/contests/[A-Za-z0-9_-]+/tasks/|usaco\.org/index\.php\?page=viewproblem|judge\.yosupo\.jp/problem/` | 0 | No breach. |
| C — candidate rows | `^(\s*[-*]|\|)\s*.*\b(abc|arc|agc|dp)[0-9]{2,4}_[a-z]\b` (case-insensitive) | 0 | No breach. |
| D — fenced blocks | `^\`\`\`` | 80 delimiters / 40 blocks | All benign; classification below. |
| E — enumerating endpoint | `problemset\.problems|api\.codeforces\.com` (case-insensitive) | 14 | All benign policy/access-path prose; no retained response. |

Every Scan D block was opened and read:

- **21** form/schema skeletons: `02_` 10; `04_` 5 including the argument slot; `11_` 4; `dry-run/03_` 2.
- **2** quarantine record shapes: `08_` lines 474–488 and `09_` lines 547–561.
- **10** synthetic dry-run transcript blocks: `dry-run/02_` 9 and `dry-run/03_` 1.
- **6** validator/derivation blocks: `traceability/07_` 2, `traceability/09_` 1, `traceability/11_` 3.
- **1** local test output block: `09_` lines 682–687.

None contains sourced problem statement text, a source sample case, a source-native candidate identifier set, or a serialized endpoint response.

The 14 Scan E hits are: `01_` lines 92, 161, 206; `03_` lines 67, 86, 217, 221; `07_` line 276; `09_` line 373; `11_` line 506; `90_` line 286; `91_` lines 251, 411; and `traceability/03_` line 32. Every hit describes the endpoint, the access prohibition, or the fact it was not called. No hit is a response or retained enumeration.

## 7. Cross-reference resolution

**Result: FAIL — two inter-document references do not resolve as written.**

Method: inventory backticked `.md` references recursively, resolve literal relative paths from the authoring file, resolve documented external C005 paths against `docs/research/`, and compare each named `§` target with the target's heading inventory. The broad lexical inventory found 558 backticked `.md` occurrences and 122 distinct textual tokens; shorthand such as `03_…`, ranges, and prose-only mentions required contextual reading rather than blind path joining.

Confirmed failures:

1. `93_review-correction-pass.md` line 87 cites `../01_provenance-and-rights.md` from the package root. Literal resolution is `docs/research/01_provenance-and-rights.md`, which does not exist. The intended C009 sibling is `01_provenance-and-rights.md` without `../`.
2. `13_decision-risk-metric-and-prototype-records.md` line 59 cites `08_authoring-workflow-and-in-situ-review-loop.md` **§0.2**. The file exists, but its headings go from `## 0. The result, stated first` directly to `## 1`; no §0.2 exists.

I did not count context-resolvable external references as failures. For example, bare mentions of `03_requirement-decision-mapping-gate.md` §4 resolve from surrounding fully qualified citations to `C005-product-foundation/measurement-contracts/03_requirement-decision-mapping-gate.md`, where §4 exists at line 104; bare `02_authoring-requirements.md` §4.3 references resolve to `C005-dp-map-package/02_authoring-requirements.md`, where §4.3 exists at line 208.

There are also imprecise but human-resolvable section labels: `§Decision.3` refers to the `## Decision` → `### 3. The selection rule` hierarchy, and `README.md §Binding upstream` abbreviates the actual `## Provenance` section's opening label. I did not count those as missing because the named hierarchy/text is uniquely locatable. The two failures above are not similarly resolvable as written.

**Disagreement with the published gate:** `92_` §7 reports cross-reference resolution as passing; the current tree does not.

## 8. The 13-item C005 §8 acceptance checklist

**Result: 13/13 conform; four items pass VACUOUSLY.**

| # | Independent result | Denominator and evidence |
| ---: | --- | --- |
| 1 | **VACUOUS** | 0/0 course sequences: the package authors no course (`README.md` line 22). `07_` lines 147–171 nevertheless labels graph ordering structural, not measured learning order. |
| 2 | **VACUOUS** | 0/0 authored edges. The field-only rule is explicit in `02_` lines 240–244. |
| 3 | **VACUOUS** | 0/0 authored boundary terminals. `02_` lines 236–239 and `traceability/02_` line 55 treat them as sanctioned stops taking no forms. |
| 4 | **PASS** | 10/10 `INC-C1` gaps remain unauthored and incompleteness is explicit (`02_` lines 437–445; `05_` lines 246–257). |
| 5 | **PASS** | 2/2 dangling declarations remain in place (`05_` lines 250–255). |
| 6 | **PASS** | 1/1 re-derivation rule; validator evidence is 179/179 agree (`07_` lines 14, 124, 224; `traceability/07_` lines 50–94). |
| 7 | **PASS** | 8/8 consumed provisional-reliance classes are surfaced with owners/triggers (`traceability/07_` lines 21–46 and 209–219). |
| 8 | **VACUOUS** | 0/0 problem-level citations: all citation verification remains gate-blocked (`03_` lines 124–142 and 181–202). No citation was invented. |
| 9 | **PASS** | 17/17 performance statements audited; 0 presented as measured (`04_` lines 219–230; `traceability/04_` lines 131–144). |
| 10 | **PASS** | 4/4 graph-order assertions retain the structural/not-learning-order label (`02_` lines 242–245; `07_` lines 34, 171, 216). |
| 11 | **PASS** | 13/13 sub-tasks carry residual ownership; the aggregate check is recorded at `13_` line 102. |
| 12 | **PASS** | 1/1 decomposition mechanism sequences derived work on input versions/data dependency rather than file disjointness (`13_` line 102). |
| 13 | **PASS** | 1/1 status-discipline policy and its documented ledger interactions require append/union, never replacement (`README.md` lines 56–68; `00_` lines 81, 92). This is not vacuous. |

## A. Mechanism arithmetic re-derived before comparison

I read only `11_package-end-to-end-proof-and-exemplars.md` §10.1 first and counted the 23 rows by their literal `Mechanism` cells:

| Mechanism | My count | Row ids |
| --- | ---: | --- |
| `deterministic` | **15** | 1, 2, 4, 5, 6, 8, 12, 13, 14, 15, 16, 17, 18, 20, 23 |
| `schema` | **4** | 3, 7, 11, 19 |
| `AI` | **2** | 21, 22 |
| `automated` | **1** | 10 |
| `server-side` | **1** | 9 |
| **Total** | **23** | |

Only after writing down those counts did I read §10.2. Its published roll-up says `deterministic` **14**, `schema` **5**, `server-side` 1, `automated` 1, `AI` 2.

**They disagree.** The published roll-up has moved one row arithmetically from `deterministic` to `schema`, but no §10.1 row supports that move. The discrepancy is exactly one row in each of those two classes; §10.1 itself does not identify a schema row omitted from my list or a deterministic row that should be excluded. The row-level table is the evidence: literal recount is **15 deterministic / 4 schema**, versus published **14 / 5**.

## B. Cap arithmetic re-derived before comparison

Before reading `91_caps-and-incomplete-scope.md` §R.1, I counted cap definition headings in the preceding SUB sections:

SUB-1 6; SUB-2 6; SUB-3 7; SUB-4 6; SUB-5 5; SUB-6 6; SUB-7 6; SUB-8 4; SUB-9 7; SUB-10 6; SUB-11 3; SUB-12 1; SUB-13 1. **Total: 64.** Suffixes are contiguous within every section; duplicate ids and numbering gaps are zero.

I then read §R.1. Its published per-section figures and total are identical: **63 caps across the 12 sections preceding SUB-12, 64 across all 13 after SUB-12**. **The arithmetic agrees.** Repeated cap titles about the unconfigured QA engine are semantic repetition, not duplicate ids or an arithmetic collision.

## What I could not verify

1. **Human/operator independence:** I verified different model ids and relied on the supplied fact that I authored none of the package. Repository contents cannot prove whether prompts, operators, or hidden context were shared.
2. **External truth behind documentary rights claims:** I could execute the repository scans and read every hit, but I did not contact external sources, re-read live terms, robots files, or rate limits. The package itself says that verification was not performed.
3. **Absolute semantic absence beyond the declared scans:** lexical scans plus reading all 40 fenced blocks and all 14 endpoint hits found no breach. No finite regex proves that an obliquely paraphrased problem statement cannot exist elsewhere in prose.
4. **A machine-exact total for every prose shorthand reference:** the package uses ellipses (`03_…`), bare filenames whose full external path is supplied nearby, hierarchy labels such as `§Decision.3`, and prose labels rather than Markdown anchors. I resolved these contextually and confirmed the two failures above, but no canonical reference grammar exists from which to produce a complete mechanically certified denominator.

## Final write-scope check

Final command: `git diff --numstat`. **Raw output: empty**, because the only new file is still untracked and ordinary `git diff` does not list untracked files. `git status --short` returned exactly:

```text
?? docs/research/C009-course-content-quality/94_independent-gate-reverification.md
```

For a numeric check of that untracked file, `git diff --numstat --no-index /dev/null docs/research/C009-course-content-quality/94_independent-gate-reverification.md` returned `238  0` on the final file. The pre-write worktree baseline was empty. No existing package file was modified by this run.
