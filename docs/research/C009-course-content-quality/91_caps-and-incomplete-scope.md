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

### SUB-2 — NEU-958, content and exercise forms (OUT-1)

**Disambiguation, because the token collides.** `CAP-S1-6` above refers to a **`SUB-2` of the C005 *schema* package** as the owner of `D-F3a`. That is **not this sub-task.** This section is **SUB-2 of charter C009 (NEU-958)**, the form catalogue. The two are unrelated and no entry here binds the C005 schema.

#### `CAP-S2-1` — **the problem-reference field set is CONSUMED, not decided** · unresolved by design

| | |
| --- | --- |
| **Cap** | `02_content-and-exercise-forms.md` §5 specifies the problem-reference form for **both** `D-F5` dispositions, with the **restricted** shape — `stable_id` + `canonical_url` only — as the sole fillable one. It **decides nothing**: the field set is SUB-1's cap, cited by id (`CH-F5-1`, `DR-C09-01`, `CAP-S1-2`) and **never restated or re-derived**. |
| **What this sub-task did not do** | It did not widen the set, did not argue for widening it, and did not treat its own need for richer fields as grounds to widen it. The wider fields appear **only** as `NOT-YET-STORABLE`, offered by no template as fillable and never presented as the current form. |
| **Owner** | **NEU-932 (`D-F5`'s owner) — the creator by default.** A producing task may not promote its own artifact (`A1`–`A5`). |
| **Closes when** | **The foundations ledger records a disposition for `CH-F5-1`.** Not by this catalogue needing the fields, and not by a downstream sub-task deciding it does. |

#### `CAP-S2-2` — **`qa-execution:engine` is unconfigured; the QA-execution phase is a genuine no-op** · not closable here

| | |
| --- | --- |
| **Cap** | This project's capability registry resolves to **`git, linear`** only. **No capability owns the `qa-execution:engine` surface**, so the QA-execution phase is a genuine **Core Article 8 no-op** — core ships a lean default and runs inert when no capability is registered. |
| **What that means, stated plainly** | **No QA pass, scenario, verdict, report or coverage claim is asserted or implied anywhere in SUB-2's output.** The fabrication probe (`dry-run/02_…`) is a **hand-run structural check recorded by the task that ran it** — it is not a QA run and is not presented as one. Fabricating a QA pass to fill the gap would be the same failure class as fabricating a citation. |
| **Owner** | the creator / whoever registers a `qa-execution` capability |
| **Closes when** | A capability owning `qa-execution:engine` is registered **and** a run is actually performed and recorded. Not before. |

#### `CAP-S2-3` — **the fabrication probe is one run by one agent** · bounded, not closable here

| | |
| --- | --- |
| **Cap** | The probe (`dry-run/02_…`) passed **10/10** at its stated condition, with the problem-reference template — the exact `EXC-1` site — returning an explicit refusal in **both** fields, unprompted. That is **one observation, not a distribution.** A single cold-agent run cannot establish that no template can ever induce fabrication. |
| **What this run deliberately could not admit** | A **verified** citation. The charter's OUT-1 wording admits one; this run satisfies that wording **only in its refusal branch**, because "verified" is defined by **SUB-3's** procedure and that procedure does not exist at this cutoff. A produced citation of any kind was therefore scored a failure here. |
| **Owner** | **SUB-3 (NEU-959)** — owner of the second, admitting probe run. |
| **Closes when** | SUB-3 re-runs the probe against a real verification procedure and its result is cited back into this package. |

#### `CAP-S2-4` — **the catalogue defines fields; it sets no bar and no gate** · out of scope by design

| | |
| --- | --- |
| **Cap** | This sub-task defines **what a form is** — its fields and their obligations. It does **not** define how good an instance must be. The correctness standards for `solution`, `proof` and `test` are **SUB-4's**; which gate validates a form, and any severity tier or lint rule, is **SUB-9's (NEU-965)**; the discriminating design of gate-bearing items is **SUB-6's**; exemplars are **SUB-11's**. |
| **The consequence, named rather than left implicit** | The REQUIRED misconception/edge-case pair is a **structural obligation of the form definition** — a submission omitting it is not a valid instance. **Nothing in this package enforces that at runtime**, because no enforcement surface exists yet. A form definition that rejects is not the same as a gate that blocks. |
| **Owner** | SUB-4, SUB-6, SUB-9, SUB-11 respectively |
| **Closes when** | Each named sub-task lands its half. This entry is the seam, not a defect. |

#### `CAP-S2-5` — **the structural checks were run by the task that produced the artifact** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | The traceability audit, the misconception/edge-case structural check and the anti-fabrication greps in `traceability/02_…` were **run by SUB-2 over SUB-2's own document**. Inherited from `CAP-S1-4`: a producing task self-checking its own artifact is weaker evidence than an independent pass. |
| **Mitigation actually applied** | The fabrication probe was delegated to a **cold agent with no prior context and no priming toward refusal** — the one check that could be made genuinely independent was. The remaining checks are mechanical (presence, count, grep) rather than judgemental, which bounds how much the self-check can flatter itself. |
| **Owner** | **NEU-969 (SUB-12)** at the completeness gate; reviewers of this change |
| **Closes when** | An independent pass re-runs the checks — the completeness gate (`92_package-completeness-gate.md`) is the natural site. |

#### `CAP-S2-6` — **the anti-fabrication greps are lexical; a disguised plausible value is beyond them** · non-closable by any scan

| | |
| --- | --- |
| **Cap** | Inherited directly from **`CAP-S1-5`** and re-stated here because this sub-task's central constraint depends on it. The checks that no template contains a copyable identifier or address are **lexical**. They prove structural absence of the obvious shapes. **They cannot prove that no placeholder anywhere reads, to some future author, as data.** No grep can. |
| **What was done instead of pretending otherwise** | Every placeholder is angle-bracketed instruction text in the imperative, and **every one of the ten templates carries its own refuse-rather-than-invent line** rather than relying on one global statement — a redundancy chosen precisely because the lexical check cannot certify the property. |
| **Owner** | **SUB-1 (NEU-957)** as residual owner of OUT-7; a **review obligation on every C009 sub-task**, this one included |
| **Closes when** | It does not. It is bounded, not closable. |

### SUB-4 — NEU-960, correctness standards and authoring languages (OUT-2)

**What this section is.** SUB-4 publishes four correctness standards, two authoring-language decisions and a membership-by-id selection rule. **Everything it deliberately did not do — the gates it did not assign, the review it did not run, the numbers it did not measure and the field set it did not widen — is below.** A cap recorded is not a failure; a cap not recorded is.

#### `CAP-S4-1` — **`qa-execution:engine` is unconfigured; the QA-execution phase is a genuine Core Article 8 no-op** · not closable here

| | |
| --- | --- |
| **Cap** | This project's capability registry resolves to **`git, linear`** only. **No capability owns the `qa-execution:engine` surface**, so the QA-execution phase is a genuine **Core Article 8 no-op** — core ships a lean default and runs inert when no capability is registered. **Not a skipped phase, not a deferred one, not a waived one.** |
| **What is claimed** | **Nothing. No QA pass, scenario, verdict, report or coverage claim is asserted or implied anywhere in SUB-4's output.** Fabricating one to fill the gap would be **the same failure class as fabricating a citation** — a result presented for a run that did not happen. |
| **What verification actually is** | **File inspection and `git diff`**, resolved against the task's numbered success criteria: the three new files exist at exactly their stated paths and carry their `**Model:**` attribution, the two shared registers show **zero deletions**, the change set is exactly the five package paths, and **zero paths under `docs/research/C005-*` are touched**. The repo's own gates are **no-regression checks only** — `lint`'s scope is literally `src tests` and **never sees `docs/`**, so a green line there is **not evidence about anything in this package**. |
| **Consistency** | Explicitly consistent with **`CAP-S1-3`** and **`CAP-S2-2`**, which record the same no-op for the same registry. This is the third independent statement of it, not a new finding. |
| **Owner** | **the creator** — registering a QA-execution provider is a repository-configuration decision, not a sub-task's. |
| **Closes when** | A provider owning **`qa-execution:engine`** is registered **and** this package acquires runtime behaviour worth exercising. **Neither is expected within C009.** |

#### `CAP-S4-2` — **no blocking behaviour and no placement is assigned; SUB-4 assigns the mechanism axis only** · out of scope by design

| | |
| --- | --- |
| **Cap** | The pre-classification in `04_…` §3.1 assigns **the mechanism axis and nothing else**, from SUB-9's five published values — `deterministic`, `schema`, `server-side`, `automated`, `AI`. **It asserts no gate, no severity, no behaviour on failure, and no placement.** SUB-9 (NEU-965) owns **both** of those axes and SUB-4 assigns **neither**. |
| **How binding it is** | **PROVISIONAL and NON-BINDING.** **SUB-9 re-expresses the table in the published scheme, may reassign any mechanism with a recorded reason, and SUB-9's assignment is the one that governs.** SUB-4 runs in `[P1]`, **seven positions before SUB-9**, and asserts no enforcement rule it does not own. |
| **The consequence, named rather than left implicit** | A standard that fails an artifact is a **rule a reviewer applies**, not a gate that blocks. **Nothing in SUB-4's output enforces anything at runtime**, because no enforcement surface exists yet. The generic validation surface described in `04_…` §6 is **described, not decided** — SUB-9 decides what is implemented. |
| **Owner** | **SUB-9 (NEU-965).** |
| **Closes when** | **SUB-9 publishes the enforcement scheme and re-expresses the pre-classification table in it.** Not by review of this document, and not by a later sub-task treating a mechanism value as settled. |

#### `CAP-S4-3` — **the standards-conformance review of the package's exemplars is SUB-11's — cited, never produced, never waited on** · seam, not defect

| | |
| --- | --- |
| **Cap** | The standards-conformance review of the package's exemplars is **OUT-2's primary verification signal**, and it is **owned and run by SUB-11 (NEU-967)**. **SUB-4 does not produce it and does not claim its result.** SUB-4 runs **seven positions earlier in `[P1]`**, and **the exemplars do not exist at this cutoff** — so **SUB-4's completion never waits on that review.** |
| **What SUB-4 produced instead** | Its own **exemplar-free end-to-end check**: the three-artifact violation-detection walkthrough (`04_…` §7). Three non-conforming artifacts are constructed inline and walked to a failure naming the standard, the exact field or payload slot, and the mechanism value that catches it — **with no authored content, no node id, no citation and no external reference.** A standard that could only be checked by first authoring an exemplar would be a standard nobody could apply until the exemplars existed; that coupling is what the walkthrough removes. |
| **What the walkthrough is not** | **It is not a substitute for SUB-11's review and is never presented as one.** It exercises the standards against artifacts SUB-4 constructed to fail; it says nothing about whether real exemplars pass. |
| **Owner** | **SUB-11 (NEU-967).** |
| **Closes when** | **SUB-11 runs the standards-conformance review against these four standards and its result is cited back into this package.** |

#### `CAP-S4-4` — **every NEU-941 performance verdict is directional, never quantified (`JS-U2`)** · non-closable within C009

| | |
| --- | --- |
| **Cap** | **NEU-941 implemented nothing, benchmarked nothing, timed nothing, and selected no runtime, compiler or sandbox** — that was **out of scope by its own spec**, and it is recorded as **`JS-U2`**. Every performance, speed, cost or constant-factor statement inherited from it is therefore **directional only**. |
| **What that binds here** | **No performance statement anywhere in SUB-4's output is presented as a measurement.** It applies in **both** directions and to **both** languages: SUB-4 does **not** claim the no-hatch TypeScript rewrite is too slow, that C++17 is fast enough, or that any technique clears any threshold in any runtime. `DR-C09-04`'s rejection of the no-hatch alternative **stands entirely on pedagogical accuracy and needs no performance claim at all.** Every such statement across the three new files is listed and labelled in `traceability/04_standards-evidence-and-scope-audit.md`. |
| **What a reader must not do** | **A reader needing a threshold will not find one here and MUST NOT INFER ONE.** Converting a directional verdict into a quantity would manufacture a measurement out of a declined scope — the same failure class as a fabricated fetch result. |
| **Owner** | **NEU-941 / the creator** — the audit's owner declined the scope; this package inherits the decline rather than quietly resolving it. |
| **Closes when** | **An implementation-and-measurement pass is actually run**, against a selected runtime and a real workload. **Out of scope for C009.** |

#### `CAP-S4-5` — **the interim `stable_id` + `canonical_url` field set is CONSUMED, not re-decided** · unresolved by design

| | |
| --- | --- |
| **Cap** | The solution standard's `problem_ref` carries **`stable_id` and `canonical_url` only** — the interim set governed by open ledger challenge **`CH-F5-1`**. It is **cited by id — `CH-F5-1`, `DR-C09-01`, `CAP-S1-2` — and never restated, re-derived or re-argued.** The wider set (`title`, numeric `constraints`, difficulty signal, curriculum placement) appears nowhere as fillable and remains **NOT-YET-STORABLE**. |
| **What this sub-task did not do** | **It did not widen the set, did not argue for widening it, and did not treat its own needs as grounds to widen it.** A producing task may not promote its own artifact (`A1`–`A5`), and needing a field is not an adjudication. **An unverifiable value is REFUSED, NEVER INVENTED** — every `problem_ref` in `04_…` §7's constructed artifacts reads exactly `REFUSED — not verifiable`, and every node id in them is a withheld placeholder, under `C2` / `EXC-1`. |
| **What is not blocked** | Nothing in the four standards depends on the outcome. The standards attach to SUB-2's fields and to node-level structure; the field-set question touches one field of one form. That independence is what makes consuming the cap cheap enough to be the honest option. |
| **Owner** | **NEU-932 (`D-F5`'s owner) / the creator** (default) — surfaced for reassignment. |
| **Closes when** | **The foundations ledger records a disposition for `CH-F5-1`** (`OI-S1-13`). Not by this package needing the fields, and not by a downstream sub-task deciding it does. |

#### `CAP-S4-6` — **SUB-4's structural checks were run by the task that produced the artifact** · mitigated, not closed

| | |
| --- | --- |
| **Cap** | The scope audit over the 19 ids, the `JS-U2` directional-statement audit, the field-name and skill-type conformance greps, and the three-artifact walkthrough in `04_…` §7 were **run by SUB-4 over SUB-4's own documents**. Inherited directly from **`CAP-S1-4`** and **`CAP-S2-5`**: an author checking its own completeness shares the author's blind spots by construction. |
| **Mitigation, not a fix** | The **mechanical** half is **reproducible by anyone**: each of the 19 node ids is matched by exact string against the upstream audit register, the directional-statement audit records each statement's file and location, and every field name and skill-type literal is grep-checkable in both directions against `02_content-and-exercise-forms.md`. The **judgment** half — is a standard's correctness obligation the right bar? is the walkthrough's failure the failure a real reviewer would hit first? — **remains unvalidated by an independent reader.** |
| **Owner** | **NEU-969 (SUB-12)** at the completeness gate; and any reviewer of this change. |
| **Closes when** | **An independent pass re-runs the mechanical checks and reviews the judgment calls** — **`92_package-completeness-gate.md`'s run is the intended occasion.** |

