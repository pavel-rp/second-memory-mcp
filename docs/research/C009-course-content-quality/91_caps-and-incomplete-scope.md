# 91 — Caps and Incomplete Scope (shared, package-level)

**Package:** C009 course content quality · **Charter:** C009 (umbrella NEU-890) · **Opened:** 2026-08-10 by **NEU-957 (SUB-1)** · **Writers:** all thirteen sub-tasks, by append · **Reconciled at the end by:** **NEU-969 (SUB-12)** · **Status:** **this file SETS no status.** Status lives in a ledger
**Model:** claude-opus-5[1m]

**What each sub-task did not do, could not do, and deliberately declined to do.** Each entry names a **missing artifact or a bounded limitation with an owner** — reported, never invented (NEU-899 rule 4, inherited). A cap recorded here is not a failure; **a cap that was not recorded is.**

---

## Append convention — read this before writing a single line

> Each sub-task appends its own `### <SUB-id>` section. No sub-task reflows, renumbers, or rewrites another sub-task's entries. On a merge conflict in this file, keep **both** sides.

**Why it is stated this bluntly.** Up to **three of the thirteen sibling sub-tasks are in flight concurrently**, none of them able to see another's working tree, and **all thirteen** write into this file and into `90_open-items-and-provisional-register.md`. That makes both files **merge-conflict magnets**, and the default resolution — pick one side — silently deletes a sibling's cap. **A cap that is silently deleted is the worst outcome this register has:** the package then reads as more complete than it is, which is exactly the impression the register exists to prevent. Keeping both sides converts that failure into a **visible duplicate** — noisy, harmless, and fixable by one declared owner at the end.

**Duplicates are expected and are not cleaned up in flight.** **NEU-969 (SUB-12) is the declared single owner that reconciles the caps register at the end** — it merges duplicate entries across both shared registers, resolves cross-references, ranks the package's residual weaknesses, and publishes the reconciled result alongside the completeness gate (`92_package-completeness-gate.md`). Until SUB-12 runs, a duplicate entry is correct-by-convention, and any other sub-task that "tidies" one is destroying evidence rather than helping.

**Id namespacing.** Each sub-task ids its own entries `CAP-S<n>-k` (SUB-1's are `CAP-S1-1` … `CAP-S1-6`), so two sections appended concurrently can never collide on an id and no sub-task ever needs to renumber another's.

---

## Entries

### SUB-1 — NEU-957, provenance and rights (OUT-7)

#### `CAP-S1-1` — **no network re-fetch was available or permitted; the re-verification is documentary** · not closable here

| | |
| --- | --- |
| **Cap** | **No network access was available to this sub-task and none was permitted. Zero HTTP requests were issued.** No licence page, terms-of-service document, `robots.txt`, API endpoint or rate-limit header was read on 2026-08-10 for **any** of the twelve sources. **There is therefore no live terms, robots or rate-limit reading for any source at this cutoff.** |
| **What the pass actually is** | A **documentary re-verification**: each of the twelve dispositions was re-read from the recorded C005 files and their recorded evidence, checked for internal consistency against the stricter bar C009 operates under, and re-dated at the 2026-08-10 cutoff. Every "what was checked" cell in `01_provenance-and-rights.md` §1 says so in its own words, so **no row can be mistaken for a live fetch**. |
| **What it costs** | The pass **cannot detect a change made at any source since 2026-07-16**. Its claim is not "nothing changed"; it is "no evidence of change was read, and none could have been". |
| **What it does not cost** | The failure direction is the safe one. Under the restricted-by-default rule (`00_method-and-provenance.md` §4.4) all twelve access rows are recorded **restricted**, so the package is **more** restrictive than the baseline, never less. **An inability to read a source's terms is never read as permission.** |
| **What was refused** | **Fabricating a live fetch result was an absolute prohibition and no such result appears anywhere.** No cell reads "verified 2026-08-10" against a source that was not contacted. Writing one would have made the package look finished and would have planted a false rights record that SUB-3 would consume as a precondition and act on. |
| **Owner** | **the creator** (default, consistent with `CAP-2`'s owner precedent) — surfaced for reassignment |
| **Closes when** | **Network access becomes available to a re-verification pass** and each source's terms are read and dated with a new cutoff. The twelve per-source gaps are filed individually as `OI-S1-1` … `OI-S1-12` in `90_open-items-and-provisional-register.md`. **No fetch outcome, absent `robots.txt`, or unenforced rate limit closes it.** |

#### `CAP-S1-2` — **the permitted-field question is FILED, not decided** · unresolved by design

| | |
| --- | --- |
| **Cap** | Four of the six candidate problem-reference fields — `title`, numeric `constraints`, difficulty signal, curriculum placement — are recorded **NOT ADMITTED on this package's judgment** and are **routed to ledger challenge `CH-F5-1`** against `D-F5`. **This sub-task files that challenge; it does not resolve it**, and `decision-records/DR-C09-01_permitted-field-set.md` sets no status of its own. |
| **Why it is a cap and not a decision** | **A producing task may not promote its own artifact** (`A1`–`A5`). SUB-1 produced the argument, so SUB-1 may not also ratify it. The alternative — admitting the fields locally on charter assumption 19 — would have produced a field set that *looks* adjudicated and that twelve sibling sub-tasks would build citations against, on an assumption that is still **`[unconfirmed]`**. |
| **What binds in the meantime** | **The interim stored set is `stable id` + `canonical URL` only**, binding every C009 sub-task from the moment `01_provenance-and-rights.md` landed. A sub-task needing a wider set cites `CH-F5-1` by id, records its position for **both** dispositions, and carries the unresolved field set as its own cap here. **It never widens locally.** |
| **What is not blocked** | Nothing else in the package depends on the outcome: the dispositions, the access-permission record, the no-text rule and the retention rule are all independent of the field set. That independence is deliberate — it is what makes filing the challenge cheap enough to be the honest option. |
| **Owner** | **NEU-932 (`D-F5`'s owner) / the creator** (default) — surfaced for reassignment |
| **Closes when** | **The foundations ledger records a disposition for `CH-F5-1`** (`OI-S1-13`). |

#### `CAP-S1-3` — **`qa-execution:engine` is unconfigured; the QA-execution phase is a genuine no-op** · not closable here

| | |
| --- | --- |
| **Cap** | This repository's capability registry resolves to **`git, linear`** only. **No `qa-execution:engine` provider is registered.** The automated QA-execution phase is therefore a genuine **Core Article 8 no-op** for this package — **a phase with no provider, not a phase that was skipped, deferred, or waived.** |
| **What is claimed** | **Nothing. No QA pass is claimed, fabricated, or implied anywhere in this package**, and no scenario, run, verdict or report is written as though an engine had executed one. **A QA report for a run that did not happen would be a fabricated result of exactly the kind `CAP-S1-1` refuses for fetches** — the same failure, in a different register. |
| **Why it is the correct outcome here** | This package is a documentation deliverable. It changes no source, no schema, no migration and no runtime behaviour, so there is **nothing a browser or execution engine could exercise**. A QA plan generated for it would be a build/static and document-inspection plan only. |
| **What verification actually is** | **File inspection and `git diff`**, resolved against the task's numbered success criteria: the package file set exists and is non-empty, every file carries its `**Model:**` attribution, the protected C005 files show no diff, and the one cross-package ledger edit is **additions-only**. The repository's own gates (`pnpm run type-check`, `pnpm run lint`) are recorded as **no-regression checks only** — `lint`'s scope is literally `src tests` and it never sees `docs/`, so a green line there is not evidence about anything in this package. |
| **Owner** | **the creator** — registering a QA-execution provider is a repository-configuration decision, not a sub-task's |
| **Closes when** | A `qa-execution:engine` provider is registered in the capability registry **and** this package acquires runtime behaviour worth exercising. Neither is expected within C009. |

#### `CAP-S1-4` — **the self-check and the scans were run by the task that produced the artifact** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | `01_provenance-and-rights.md` §9's rights checks — including the two **new** ones, `RC-7` (the completed per-source access-permission record) and `RC-8` (the stated retention disposition) — and §10's repository scan were **run by SUB-1 against SUB-1's own package**. An author checking its own completeness shares the author's blind spots by construction. |
| **Mitigation, not a fix** | The **mechanical** half is reproducible by anyone: §10 records each scan's command, date, commit base and outcome, so a reviewer can re-run all five and compare. The **judgment** half — is the disposition set complete? is a rule stated tightly enough to bind? — remains unvalidated by an independent reader. |
| **Owner** | **NEU-969 (SUB-12)** at reconciliation, and any reviewer of the C009 package |
| **Closes when** | An independent reader re-runs the checks and reviews the judgment calls. **`92_package-completeness-gate.md`'s run is the intended occasion.** |

#### `CAP-S1-5` — **the no-text and retention scans are lexical; semantic paraphrase is beyond them** · non-closable by any scan

| | |
| --- | --- |
| **Cap** | The detection methods of `01_provenance-and-rights.md` §5.1 and §6 are **lexical greps**. They prove the **structural absence** of stored statements, problem-level URLs, enumerated id lists and fenced example or response blocks. **They cannot prove that no sentence anywhere is a disguised paraphrase of a protected statement** — and no grep can. |
| **Why it is named rather than papered over** | *Paraphrased into storage* is listed as its own mode in §5 precisely because it is the mode the scan cannot reach. Presenting a lexical pass as mechanical completeness would be the strongest and least honest claim in the package. |
| **Residual** | A **review obligation on every C009 sub-task**, inherited from here rather than discovered later. |
| **Owner** | **SUB-1 (NEU-957)** as residual owner of OUT-7; enforced at review by every sub-task |
| **Closes when** | It does not. It is bounded, not closable — the honest statement of what a scan can and cannot establish. |

#### `CAP-S1-6` — **caps inherited from C005 that this pass does not close**

**Listed so this package's limits are not mistaken for the sources' limits.** None is closable by a documentary re-verification.

| Inherited cap | Why it does not close here | Owner |
| --- | --- | --- |
| **`CAP-2`** — problem-level citations unverified; an entry-level automated fetch returned **HTTP 403** at the prior cutoff. | **No fetch was attempted at this cutoff, so no new information about the 403 exists.** A refusal is evidence of refusal, never of permission. Closing it requires corpus access and per-problem verification — **SUB-3's (NEU-959) work, not SUB-1's.** **This package asserts no problem id.** | the creator / SUB-3 |
| **T2's licence has never been machine-verified** — asserted from the work's stated terms at **two consecutive cutoffs** now. | A documentary re-read cannot verify what was never observed. The disposition (INFORM-ONLY, NC clause disqualifying) is carried forward **undiminished, not downgraded by age**; `OI-S1-2` carries the gap. | the creator (default) |
| **T4's specific catalogue entry ids remain unverified** (`INC-D4`). | Same ground as `CAP-2`: unverifiable without access. **No entry is cited until SUB-3 has resolved it.** | SUB-3 / the coverage-audit owner |
| **`D-F3a` is `unresolved — by design`** — the node schema that will govern stored fields does not yet exist. | Bound when SUB-2 lands in the C005 schema package. This package quotes `D-F3a`'s **inherited field constraint** as the admission rationale for two fields; it does not and may not bind the schema. | SUB-2 (C005 schema package) |
| **The C005 baseline's summary-line arithmetic slip** (`RC-2` and the `D-F5` ledger row summarise 13 dispositions against a 12-source set). | **Recorded, never corrected — this package edits neither the baseline file nor any ledger row in place.** It bears on no per-source disposition. Filed as `OI-S1-14`. | NEU-932 / the creator (default) |
